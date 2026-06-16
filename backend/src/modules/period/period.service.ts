import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PeriodService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async getState() {
    let state = await this.prisma.systemState.findUnique({
      where: { id: 'default' },
    });
    if (!state) {
      state = await this.prisma.systemState.create({
        data: { id: 'default', businessDate: new Date(), isOpen: true },
      });
    }
    return state;
  }

  async startOfDay(userId: string) {
    const state = await this.getState();
    if (state.isOpen) {
      throw new BadRequestException(
        'Start of Day failed: The system is already OPEN.',
      );
    }

    const nextDate = new Date(state.businessDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const updated = await this.prisma.$transaction(async (tx) => {
      const uState = await tx.systemState.update({
        where: { id: 'default' },
        data: {
          businessDate: nextDate,
          isOpen: true,
        },
      });

      await tx.periodLog.create({
        data: {
          action: 'SOD',
          businessDate: nextDate,
          performedBy: userId,
          details: `Started business day: ${nextDate.toISOString().split('T')[0]}`,
        },
      });

      return uState;
    });

    return { success: true, state: updated };
  }

  async endOfDay(userId: string) {
    const state = await this.getState();
    if (!state.isOpen) {
      throw new BadRequestException(
        'End of Day failed: The system is already CLOSED.',
      );
    }

    const businessDate = state.businessDate;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Accrue daily interest for active/disbursed loans
      const activeLoans = await tx.loan.findMany({
        where: {
          status: { in: ['ACTIVE', 'DISBURSED', 'OVERDUE'] },
        },
      });

      let totalInterestAccrued = 0;
      for (const loan of activeLoans) {
        const dailyInterest = Number(
          ((loan.principalAmount * (loan.interestRate / 100)) / 365).toFixed(4),
        );
        if (dailyInterest <= 0) continue;

        const txReference = `ACCR-${randomUUID()}`;
        // Debit: loan.id (LOAN asset), Credit: INTEREST-INCOME (REVENUE)
        await tx.ledgerEntry.createMany({
          data: [
            {
              accountId: loan.id,
              accountCode: '12200', // Interest Receivable
              accountType: 'LOAN',
              debit: dailyInterest,
              credit: 0,
              transactionReference: txReference,
              description: `Daily interest accrual for loan ${loan.lid || loan.id.substring(0, 8)}`,
              loanId: loan.id,
            },
            {
              accountId: 'INTEREST-INCOME',
              accountCode: '40100', // Interest Income
              accountType: 'REVENUE',
              debit: 0,
              credit: dailyInterest,
              transactionReference: txReference,
              description: `Accrued interest revenue for loan ${loan.lid || loan.id.substring(0, 8)}`,
              loanId: loan.id,
            },
          ],
        });
        totalInterestAccrued += dailyInterest;
      }

      // 2. Recalculate late days and penalties for overdue schedules
      const overdueSchedules = await tx.repaymentSchedule.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: businessDate,
          },
        },
        include: {
          loan: true,
        },
      });

      let updatedPenaltiesCount = 0;
      for (const schedule of overdueSchedules) {
        if (!schedule.loan.penaltyRate) continue;

        const diffTime = Math.abs(
          businessDate.getTime() - schedule.dueDate.getTime(),
        );
        const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const dailyPenaltyRate = schedule.loan.penaltyRate / 100 / 365;
        const penaltyAmount = Number(
          (schedule.amountDue * dailyPenaltyRate * lateDays).toFixed(2),
        );

        await tx.repaymentSchedule.update({
          where: { id: schedule.id },
          data: {
            lateDays,
            penaltyAmount,
          },
        });

        // Update loan status to OVERDUE if it is currently DISBURSED or ACTIVE
        if (['DISBURSED', 'ACTIVE'].includes(schedule.loan.status)) {
          await tx.loan.update({
            where: { id: schedule.loanId },
            data: { status: 'OVERDUE' },
          });
        }

        updatedPenaltiesCount++;
      }

      // 3. Generate Client Alerts for upcoming repayments
      const upcomingSchedules = await tx.repaymentSchedule.findMany({
        where: {
          status: 'PENDING',
          loan: { reminderPreference: { not: null } },
          dueDate: { gt: businessDate }, // Only future due dates
        },
        include: { loan: true },
      });

      let generatedAlertsCount = 0;
      for (const schedule of upcomingSchedules) {
        if (!schedule.loan.reminderPreference) continue;

        const diffTime = schedule.dueDate.getTime() - businessDate.getTime();
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntilDue === schedule.loan.reminderPreference) {
          const existingAlert = await tx.clientAlert.findFirst({
            where: {
              loanId: schedule.loan.id,
              targetDate: schedule.dueDate,
              type: 'DUE_REMINDER',
            },
          });

          if (!existingAlert) {
            await tx.clientAlert.create({
              data: {
                loanId: schedule.loan.id,
                customerId: schedule.loan.customerId,
                type: 'DUE_REMINDER',
                message: `Upcoming payment of $${schedule.amountDue} due in ${daysUntilDue} days on ${schedule.dueDate.toISOString().split('T')[0]}.`,
                status: 'PENDING',
                targetDate: schedule.dueDate,
              },
            });
            generatedAlertsCount++;
          }
        }
      }

      // 4. Update system state to CLOSED
      const updatedState = await tx.systemState.update({
        where: { id: 'default' },
        data: {
          isOpen: false,
        },
      });

      // 5. Create EOD period log
      await tx.periodLog.create({
        data: {
          action: 'EOD',
          businessDate: businessDate,
          performedBy: userId,
          details: `Closed business day: ${businessDate.toISOString().split('T')[0]}. Accrued $${totalInterestAccrued.toFixed(2)} interest on ${activeLoans.length} loans. Recalculated penalties for ${updatedPenaltiesCount} schedules. Generated ${generatedAlertsCount} client reminders.`,
        },
      });

      return {
        state: updatedState,
        interestAccrued: totalInterestAccrued,
        penaltiesRecalculated: updatedPenaltiesCount,
        remindersGenerated: generatedAlertsCount,
      };
    });

    return { success: true, ...result };
  }

  async getLogs() {
    return this.prisma.periodLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getTrialBalance() {
    // Assets: Cash Vault Balance
    const cashVault = await this.ledger.getAccountBalance('CASH-VAULT');

    // Assets: Outstanding Loan Balance
    // Sum of all LedgerEntries with accountType = 'LOAN'
    const loanEntries = await this.prisma.ledgerEntry.aggregate({
      where: { accountType: 'LOAN' },
      _sum: { debit: true, credit: true },
    });
    const loanDebits = Number(loanEntries._sum.debit) || 0;
    const loanCredits = Number(loanEntries._sum.credit) || 0;
    const outstandingLoans = loanDebits - loanCredits;

    // Revenues: Interest Income
    const interestIncome =
      await this.ledger.getAccountBalance('INTEREST-INCOME');

    // Revenues: Penalty Income
    const penaltyIncome = await this.ledger.getAccountBalance('PENALTY-INCOME');

    // System Seed Capital / Equity (To balance Cash Vault and Outstanding Loans)
    // Starting Seed Capital is estimated or just computed to balance: Equity = Assets - Liabilities/Revenue
    const totalAssets = Math.abs(cashVault.netBalance) + outstandingLoans;
    const totalRevenue =
      Math.abs(interestIncome.netBalance) + Math.abs(penaltyIncome.netBalance);

    // In our system, let's represent standard accounts:
    return {
      accounts: [
        {
          name: 'Cash Vault Account',
          code: '10100',
          type: 'ASSET',
          debit: cashVault.totalDebit,
          credit: cashVault.totalCredit,
          balance: cashVault.netBalance, // normally Debit balance
        },
        {
          name: 'Outstanding Loans Portfolio',
          code: '12100',
          type: 'ASSET',
          debit: loanDebits,
          credit: loanCredits,
          balance: outstandingLoans, // Debit balance
        },
        {
          name: 'Accrued Interest Income',
          code: '40100',
          type: 'REVENUE',
          debit: interestIncome.totalDebit,
          credit: interestIncome.totalCredit,
          balance: interestIncome.netBalance, // normally Credit balance
        },
        {
          name: 'Accrued Penalty Income',
          code: '40200',
          type: 'REVENUE',
          debit: penaltyIncome.totalDebit,
          credit: penaltyIncome.totalCredit,
          balance: penaltyIncome.netBalance, // normally Credit balance
        },
      ],
      totals: {
        totalAssets,
        totalRevenue,
      },
    };
  }

  async getJournal(dateStr?: string) {
    const state = await this.getState();

    // Parse the date safely — fall back to businessDate if missing or invalid
    let baseDate: Date;
    if (dateStr && dateStr.trim() !== '') {
      const parsed = new Date(dateStr);
      baseDate = isNaN(parsed.getTime()) ? state.businessDate : parsed;
    } else {
      baseDate = state.businessDate;
    }

    // Build UTC midnight boundaries for the day
    const dateOnly = baseDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const start = new Date(`${dateOnly}T00:00:00.000Z`);
    const end = new Date(`${dateOnly}T23:59:59.999Z`);

    return this.prisma.ledgerEntry.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        loan: {
          select: {
            lid: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
