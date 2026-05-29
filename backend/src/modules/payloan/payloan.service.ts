import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PayloanCallbackDto } from './payloan.dto';

@Injectable()
export class PayloanService {
  private readonly logger = new Logger(PayloanService.name);

  constructor(private prisma: PrismaService) {}

  async processCallback(dto: PayloanCallbackDto) {
    this.logger.log(`Received payloan callback for bill_no: ${dto.bill_no}`);

    // Save the notification for audit and idempotency
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

    // If settlement status is '0' (Settle), attempt to update the repayment schedule
    if (dto.settlement_status === '0') {
      try {
        // Assuming bill_no corresponds to the RepaymentSchedule ID
        // If not, this might throw a RecordNotFound, which we catch
        const schedule = await this.prisma.repaymentSchedule.findUnique({
          where: { id: dto.bill_no },
        });

        if (schedule && schedule.status !== 'PAID') {
          await this.prisma.repaymentSchedule.update({
            where: { id: dto.bill_no },
            data: { status: 'PAID' },
          });

          this.logger.log(
            `Successfully marked RepaymentSchedule ${dto.bill_no} as PAID`,
          );
        } else if (!schedule) {
          this.logger.warn(
            `RepaymentSchedule with id ${dto.bill_no} not found`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error updating repayment schedule for bill_no ${dto.bill_no}`,
          error,
        );
      }
    }

    return { status: 'success', notificationId: notification.id };
  }

  async getAllNotifications() {
    // Note: Prisma converts BigInt to BigInt objects, which breaks JSON.stringify.
    // We need to map them to strings.
    const notifications = await this.prisma.paymentNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => ({
      ...n,
      transactionId: n.transactionId.toString(),
    }));
  }
}
