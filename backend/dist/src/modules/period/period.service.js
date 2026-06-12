"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const crypto_1 = require("crypto");
let PeriodService = class PeriodService {
    prisma;
    ledger;
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async getState() {
        let state = await this.prisma.systemState.findUnique({ where: { id: 'default' } });
        if (!state) {
            state = await this.prisma.systemState.create({
                data: { id: 'default', businessDate: new Date(), isOpen: true },
            });
        }
        return state;
    }
    async startOfDay(userId) {
        const state = await this.getState();
        if (state.isOpen) {
            throw new common_1.BadRequestException('Start of Day failed: The system is already OPEN.');
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
    async endOfDay(userId) {
        const state = await this.getState();
        if (!state.isOpen) {
            throw new common_1.BadRequestException('End of Day failed: The system is already CLOSED.');
        }
        const businessDate = state.businessDate;
        const result = await this.prisma.$transaction(async (tx) => {
            const activeLoans = await tx.loan.findMany({
                where: {
                    status: { in: ['ACTIVE', 'DISBURSED', 'OVERDUE'] },
                },
            });
            let totalInterestAccrued = 0;
            for (const loan of activeLoans) {
                const dailyInterest = Number((loan.principalAmount * (loan.interestRate / 100) / 365).toFixed(4));
                if (dailyInterest <= 0)
                    continue;
                const txReference = `ACCR-${(0, crypto_1.randomUUID)()}`;
                await tx.ledgerEntry.createMany({
                    data: [
                        {
                            accountId: loan.id,
                            accountCode: '12200',
                            accountType: 'LOAN',
                            debit: dailyInterest,
                            credit: 0,
                            transactionReference: txReference,
                            description: `Daily interest accrual for loan ${loan.lid || loan.id.substring(0, 8)}`,
                            loanId: loan.id,
                        },
                        {
                            accountId: 'INTEREST-INCOME',
                            accountCode: '40100',
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
                if (!schedule.loan.penaltyRate)
                    continue;
                const diffTime = Math.abs(businessDate.getTime() - schedule.dueDate.getTime());
                const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const dailyPenaltyRate = (schedule.loan.penaltyRate / 100) / 365;
                const penaltyAmount = Number((schedule.amountDue * dailyPenaltyRate * lateDays).toFixed(2));
                await tx.repaymentSchedule.update({
                    where: { id: schedule.id },
                    data: {
                        lateDays,
                        penaltyAmount,
                    },
                });
                if (['DISBURSED', 'ACTIVE'].includes(schedule.loan.status)) {
                    await tx.loan.update({
                        where: { id: schedule.loanId },
                        data: { status: 'OVERDUE' },
                    });
                }
                updatedPenaltiesCount++;
            }
            const updatedState = await tx.systemState.update({
                where: { id: 'default' },
                data: {
                    isOpen: false,
                },
            });
            await tx.periodLog.create({
                data: {
                    action: 'EOD',
                    businessDate: businessDate,
                    performedBy: userId,
                    details: `Closed business day: ${businessDate.toISOString().split('T')[0]}. Accrued $${totalInterestAccrued.toFixed(2)} interest on ${activeLoans.length} loans. Recalculated penalties for ${updatedPenaltiesCount} schedules.`,
                },
            });
            return {
                state: updatedState,
                interestAccrued: totalInterestAccrued,
                penaltiesRecalculated: updatedPenaltiesCount,
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
        const cashVault = await this.ledger.getAccountBalance('CASH-VAULT');
        const loanEntries = await this.prisma.ledgerEntry.aggregate({
            where: { accountType: 'LOAN' },
            _sum: { debit: true, credit: true },
        });
        const loanDebits = Number(loanEntries._sum.debit) || 0;
        const loanCredits = Number(loanEntries._sum.credit) || 0;
        const outstandingLoans = loanDebits - loanCredits;
        const interestIncome = await this.ledger.getAccountBalance('INTEREST-INCOME');
        const penaltyIncome = await this.ledger.getAccountBalance('PENALTY-INCOME');
        const totalAssets = Math.abs(cashVault.netBalance) + outstandingLoans;
        const totalRevenue = Math.abs(interestIncome.netBalance) + Math.abs(penaltyIncome.netBalance);
        return {
            accounts: [
                {
                    name: 'Cash Vault Account',
                    code: '10100',
                    type: 'ASSET',
                    debit: cashVault.totalDebit,
                    credit: cashVault.totalCredit,
                    balance: cashVault.netBalance,
                },
                {
                    name: 'Outstanding Loans Portfolio',
                    code: '12100',
                    type: 'ASSET',
                    debit: loanDebits,
                    credit: loanCredits,
                    balance: outstandingLoans,
                },
                {
                    name: 'Accrued Interest Income',
                    code: '40100',
                    type: 'REVENUE',
                    debit: interestIncome.totalDebit,
                    credit: interestIncome.totalCredit,
                    balance: interestIncome.netBalance,
                },
                {
                    name: 'Accrued Penalty Income',
                    code: '40200',
                    type: 'REVENUE',
                    debit: penaltyIncome.totalDebit,
                    credit: penaltyIncome.totalCredit,
                    balance: penaltyIncome.netBalance,
                },
            ],
            totals: {
                totalAssets,
                totalRevenue,
            },
        };
    }
    async getJournal(dateStr) {
        const state = await this.getState();
        let baseDate;
        if (dateStr && dateStr.trim() !== '') {
            const parsed = new Date(dateStr);
            baseDate = isNaN(parsed.getTime()) ? state.businessDate : parsed;
        }
        else {
            baseDate = state.businessDate;
        }
        const dateOnly = baseDate.toISOString().split('T')[0];
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
};
exports.PeriodService = PeriodService;
exports.PeriodService = PeriodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], PeriodService);
//# sourceMappingURL=period.service.js.map