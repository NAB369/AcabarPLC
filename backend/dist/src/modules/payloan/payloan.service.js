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
var PayloanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const crypto_1 = require("crypto");
let PayloanService = PayloanService_1 = class PayloanService {
    prisma;
    ledger;
    logger = new common_1.Logger(PayloanService_1.name);
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async processCallback(dto) {
        this.logger.log(`Received payloan callback for bill_no: ${dto.bill_no}`);
        const notification = await this.prisma.paymentNotification.create({
            data: {
                billNo: dto.bill_no || '',
                transactionId: dto.transaction_id
                    ? BigInt(dto.transaction_id)
                    : BigInt(0),
                transactionDate: dto.transaction_date || '',
                transactionTime: dto.transaction_time || '',
                payerAccountNo: dto.payer_account_no || '',
                payerName: dto.payer_name || '',
                currencyCode: dto.currency_code || '',
                paymentMethod: dto.payment_method || '',
                amount: dto.amount ? parseFloat(dto.amount.toString()) : 0,
                senderBankName: dto.sender_bank_name || '',
                senderAccountName: dto.sender_account_name || '',
                settlementDate: dto.settlement_date || '',
                settlementTime: dto.settlement_time,
                settlementStatus: dto.settlement_status || '0',
                settlementErrorMessage: dto.settlement_error_message,
                remark: dto.remark,
                bankTransactionId: dto.bank_transaction_id,
            },
        });
        if (dto.settlement_status === '0') {
            try {
                await this.prisma.$transaction(async (tx) => {
                    const schedule = await tx.repaymentSchedule.findUnique({
                        where: { id: dto.bill_no },
                    });
                    if (schedule && schedule.status !== 'PAID') {
                        const amount = dto.amount ? parseFloat(dto.amount.toString()) : 0;
                        const penaltyAmount = Number(schedule.penaltyAmount || 0);
                        const totalDue = Number(schedule.amountDue) + penaltyAmount;
                        const isFullPayment = amount >= totalDue;
                        const isOverpaid = amount > totalDue;
                        await tx.repaymentSchedule.update({
                            where: { id: dto.bill_no },
                            data: {
                                status: isFullPayment
                                    ? 'PAID'
                                    : isOverpaid
                                        ? 'OVERPAID'
                                        : 'PARTIALLY_PAID',
                            },
                        });
                        const txReference = `API-REP-${(0, crypto_1.randomUUID)()}`;
                        const ledgerEntries = [
                            {
                                accountId: 'CASH-VAULT',
                                accountCode: '10100',
                                accountType: 'CASH',
                                debit: amount,
                                transactionReference: txReference,
                                description: `API Repayment received via ${dto.payment_method} (Acc: ${dto.payer_account_no})`,
                                loanId: schedule.loanId,
                            },
                        ];
                        const penaltyPaid = Math.min(amount, penaltyAmount);
                        let remaining = amount - penaltyPaid;
                        const interestPaid = Math.min(remaining, schedule.interestComponent);
                        remaining -= interestPaid;
                        const principalPaid = remaining;
                        if (principalPaid > 0) {
                            ledgerEntries.push({
                                accountId: schedule.loanId,
                                accountCode: '12100',
                                accountType: 'LOAN',
                                credit: principalPaid,
                                transactionReference: txReference,
                                description: `API Repayment applied to Principal - Installment #${schedule.installmentNumber}`,
                                loanId: schedule.loanId,
                            });
                        }
                        if (interestPaid > 0) {
                            ledgerEntries.push({
                                accountId: 'INTEREST-INCOME',
                                accountCode: '40100',
                                accountType: 'INTEREST_INCOME',
                                credit: interestPaid,
                                transactionReference: txReference,
                                description: `API Repayment applied to Interest - Installment #${schedule.installmentNumber}`,
                                loanId: schedule.loanId,
                            });
                        }
                        if (penaltyPaid > 0) {
                            ledgerEntries.push({
                                accountId: 'PENALTY-INCOME',
                                accountCode: '40200',
                                accountType: 'REVENUE',
                                credit: penaltyPaid,
                                transactionReference: txReference,
                                description: `Late fee penalty for Installment #${schedule.installmentNumber}`,
                                loanId: schedule.loanId,
                            });
                        }
                        await this.ledger.recordTransaction(ledgerEntries, tx);
                        this.logger.log(`Successfully marked RepaymentSchedule ${dto.bill_no} as PAID and updated ledger`);
                    }
                    else if (!schedule) {
                        this.logger.warn(`RepaymentSchedule with id ${dto.bill_no} not found`);
                    }
                });
            }
            catch (error) {
                this.logger.error(`Error updating repayment schedule for bill_no ${dto.bill_no}`, error);
            }
        }
        return { status: 'success', notificationId: notification.id };
    }
    async getAllNotifications() {
        const notifications = await this.prisma.paymentNotification.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return notifications.map((n) => ({
            ...n,
            transactionId: n.transactionId.toString(),
        }));
    }
};
exports.PayloanService = PayloanService;
exports.PayloanService = PayloanService = PayloanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], PayloanService);
//# sourceMappingURL=payloan.service.js.map