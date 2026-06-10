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
exports.RepaymentsService = exports.ProcessRepaymentDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const crypto_1 = require("crypto");
class ProcessRepaymentDto {
    loanId;
    amount;
    paymentMethod;
    paymentProof;
    bankAccount;
}
exports.ProcessRepaymentDto = ProcessRepaymentDto;
let RepaymentsService = class RepaymentsService {
    prisma;
    ledger;
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async processRepayment(dto) {
        const loanId = dto.loanId;
        const amount = Number(dto.amount);
        const state = await this.prisma.systemState.findUnique({ where: { id: 'default' } });
        if (state && !state.isOpen) {
            throw new common_1.BadRequestException('Repayment blocked: The business day is currently CLOSED. Please start a new day first.');
        }
        return this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.findUnique({ where: { id: loanId } });
            if (!loan)
                throw new common_1.NotFoundException('Loan not found');
            const nextSchedule = await tx.repaymentSchedule.findFirst({
                where: { loanId, status: 'PENDING' },
                orderBy: { installmentNumber: 'asc' },
            });
            if (!nextSchedule) {
                throw new common_1.BadRequestException('No pending repayment schedule found for this loan');
            }
            const txReference = `REP-${(0, crypto_1.randomUUID)()}`;
            const penaltyAmount = Number(nextSchedule.penaltyAmount || 0);
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
            const ledgerEntries = [
                {
                    accountId: 'CASH-VAULT',
                    accountType: 'CASH',
                    debit: amount,
                    transactionReference: txReference,
                    description: `Repayment received via ${dto.paymentMethod}${dto.bankAccount ? ` (Acc: ${dto.bankAccount})` : ''}${dto.paymentProof ? ` (Proof: ${dto.paymentProof})` : ''}`,
                    loanId: loanId,
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
                    loanId: loanId,
                });
            }
            if (penaltyPaid > 0) {
                ledgerEntries.push({
                    accountId: 'PENALTY-INCOME',
                    accountType: 'REVENUE',
                    credit: penaltyPaid,
                    transactionReference: txReference,
                    description: `Late fee penalty for Installment #${nextSchedule.installmentNumber}`,
                    loanId: loanId,
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
};
exports.RepaymentsService = RepaymentsService;
exports.RepaymentsService = RepaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], RepaymentsService);
//# sourceMappingURL=repayments.service.js.map