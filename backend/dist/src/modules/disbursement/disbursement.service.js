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
exports.DisbursementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const bakong_client_1 = require("./bakong.client");
const crypto_1 = require("crypto");
let DisbursementService = class DisbursementService {
    prisma;
    ledger;
    bakong = new bakong_client_1.BakongClient();
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async disburse(loanId, method = 'BAKONG', accountId) {
        const state = await this.prisma.systemState.findUnique({
            where: { id: 'default' },
        });
        if (state && !state.isOpen) {
            throw new common_1.BadRequestException('Disbursement blocked: The business day is currently CLOSED. Please start a new day first.');
        }
        return this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.findUnique({
                where: { id: loanId },
                include: { customer: true },
            });
            if (!loan)
                throw new common_1.NotFoundException('Loan not found');
            if (loan.status !== 'PENDING_DISBURSEMENT') {
                throw new common_1.BadRequestException(`Loan must be in PENDING_DISBURSEMENT status. Current: ${loan.status}`);
            }
            let disbursementRef = `DISB-${(0, crypto_1.randomUUID)()}`;
            if (accountId && accountId !== loan.customer.accountNumber) {
                await tx.customer.update({
                    where: { id: loan.customer.id },
                    data: { accountNumber: accountId },
                });
            }
            if (method === 'BAKONG' || method === 'BANK_TRANSFER') {
                const transferAccountId = accountId || loan.customer.accountNumber || loan.customer.phone;
                if (!transferAccountId) {
                    throw new common_1.BadRequestException(`Account number or phone is required for ${method} transfer.`);
                }
                const transferResult = await this.bakong.transfer({
                    accountId: transferAccountId,
                    amount: Number(loan.principalAmount),
                    currency: loan.currency || 'USD',
                    description: `Loan disbursement ${loanId}`,
                });
                disbursementRef = transferResult.transactionHash;
            }
            const updatedLoan = await tx.loan.update({
                where: { id: loanId },
                data: {
                    previousStatus: loan.status,
                    status: 'DISBURSED',
                    disbursementMethod: method,
                    disbursementRef,
                    disbursedAt: new Date(),
                },
            });
            if (loan.customer.kycStatus === 'PENDING') {
                await tx.customer.update({
                    where: { id: loan.customer.id },
                    data: { kycStatus: 'APPROVED' },
                });
            }
            const isCash = method === 'CASH';
            const creditAccountId = isCash ? 'CASH-VAULT' : 'BANK-CLEARING';
            const creditAccountCode = isCash ? '10100' : '10200';
            const creditAccountType = isCash ? 'CASH' : 'BANK';
            const txReference = `DISB-${(0, crypto_1.randomUUID)()}`;
            await this.ledger.recordTransaction([
                {
                    accountId: creditAccountId,
                    accountCode: creditAccountCode,
                    accountType: creditAccountType,
                    credit: Number(loan.principalAmount),
                    transactionReference: txReference,
                    description: `Loan disbursement for ${loanId} via ${method}`,
                    loanId: loanId,
                },
                {
                    accountId: loanId,
                    accountCode: '12100',
                    accountType: 'LOAN',
                    debit: Number(loan.principalAmount),
                    transactionReference: txReference,
                    description: `Principal disbursed to ${loan.customer.firstName} ${loan.customer.lastName}`,
                    loanId: loanId,
                },
            ], tx);
            return {
                success: true,
                loan: updatedLoan,
                disbursementRef,
                transactionReference: txReference,
                method,
            };
        });
    }
    async generateRepaymentKhqr(loanId, installmentNumber) {
        const schedule = await this.prisma.repaymentSchedule.findUnique({
            where: {
                loanId_installmentNumber: { loanId, installmentNumber },
            },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Repayment schedule not found');
        return this.bakong.generateKhqr(Number(schedule.amountDue), 'USD', `Loan ${loanId} - Installment #${installmentNumber}`);
    }
};
exports.DisbursementService = DisbursementService;
exports.DisbursementService = DisbursementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], DisbursementService);
//# sourceMappingURL=disbursement.service.js.map