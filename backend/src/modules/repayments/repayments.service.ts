import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { randomUUID } from 'crypto';

export class ProcessRepaymentDto {
  loanId: string;
  amount: number | string;
  paymentMethod: string;
  paymentProof?: string;
  bankAccount?: string;
}

@Injectable()
export class RepaymentsService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async processRepayment(dto: ProcessRepaymentDto) {
    const loanId = dto.loanId;
    const amount = Number(dto.amount);

    // Use a transaction to ensure database consistency
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new NotFoundException('Loan not found');

      // Find the next pending schedule
      const nextSchedule = await tx.repaymentSchedule.findFirst({
        where: { loanId, status: 'PENDING' },
        orderBy: { installmentNumber: 'asc' },
      });

      if (!nextSchedule) {
        throw new BadRequestException(
          'No pending repayment schedule found for this loan',
        );
      }

      const txReference = `REP-${randomUUID()}`;

      // Update schedule status
      const penaltyAmount = Number((nextSchedule as any).penaltyAmount || 0);
      const totalDue = Number(nextSchedule.amountDue) + penaltyAmount;
      const isFullPayment = amount === totalDue;
      const isOverpaid = amount > totalDue;
      
      await tx.repaymentSchedule.update({
        where: { id: nextSchedule.id },
        data: {
          status: isFullPayment
            ? 'PAID'
            : isOverpaid
              ? 'OVERPAID'
              : 'PARTIALLY_PAID',
        },
      });

      // Record to Immutable Ledger
      const ledgerEntries: any[] = [
        {
          accountId: 'CASH-VAULT',
          accountType: 'CASH',
          debit: amount,
          transactionReference: txReference,
          description: `Repayment received via ${dto.paymentMethod}${dto.bankAccount ? ` (Acc: ${dto.bankAccount})` : ''}${dto.paymentProof ? ` (Proof: ${dto.paymentProof})` : ''}`,
        },
      ];

      const penaltyPaid = Math.min(amount, penaltyAmount);
      const loanPaid = amount - penaltyPaid;

      if (loanPaid > 0) {
        ledgerEntries.push({
          accountId: loanId,
          accountType: 'LOAN',
          credit: loanPaid,
          transactionReference: txReference,
          description: `Repayment applied to Installment #${nextSchedule.installmentNumber}`,
        });
      }

      if (penaltyPaid > 0) {
        ledgerEntries.push({
          accountId: 'PENALTY-INCOME',
          accountType: 'REVENUE',
          credit: penaltyPaid,
          transactionReference: txReference,
          description: `Late fee penalty for Installment #${nextSchedule.installmentNumber}`,
        });
      }

      await this.ledger.recordTransaction(ledgerEntries, tx);

      return {
        success: true,
        transactionReference: txReference,
        message: 'Repayment processed and ledger updated successfully.',
      };
    });
  }
}
