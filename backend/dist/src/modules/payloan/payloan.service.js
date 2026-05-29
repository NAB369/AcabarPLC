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
let PayloanService = PayloanService_1 = class PayloanService {
    prisma;
    logger = new common_1.Logger(PayloanService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCallback(dto) {
        this.logger.log(`Received payloan callback for bill_no: ${dto.bill_no}`);
        const notification = await this.prisma.paymentNotification.create({
            data: {
                billNo: dto.bill_no || '',
                transactionId: dto.transaction_id ? BigInt(dto.transaction_id) : BigInt(0),
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
                const schedule = await this.prisma.repaymentSchedule.findUnique({
                    where: { id: dto.bill_no },
                });
                if (schedule && schedule.status !== 'PAID') {
                    await this.prisma.repaymentSchedule.update({
                        where: { id: dto.bill_no },
                        data: { status: 'PAID' },
                    });
                    this.logger.log(`Successfully marked RepaymentSchedule ${dto.bill_no} as PAID`);
                }
                else if (!schedule) {
                    this.logger.warn(`RepaymentSchedule with id ${dto.bill_no} not found`);
                }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayloanService);
//# sourceMappingURL=payloan.service.js.map