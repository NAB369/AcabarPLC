import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { PayloanCallbackDto } from './payloan.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PayloanService {
  private readonly logger = new Logger(PayloanService.name);

  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

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
              data: { status: isFullPayment ? 'PAID' : (isOverpaid ? 'OVERPAID' : 'PARTIALLY_PAID') },
            });

            const txReference = `API-REP-${randomUUID()}`;
            const ledgerEntries: any[] = [
              {
                accountId: 'CASH-VAULT',
                accountCode: '10100', // Cash Vault
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
                accountCode: '12100', // Loan Portfolio
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
                accountCode: '40100', // Interest Income
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
                accountCode: '40200', // Penalty Income
                accountType: 'REVENUE',
                credit: penaltyPaid,
                transactionReference: txReference,
                description: `Late fee penalty for Installment #${schedule.installmentNumber}`,
                loanId: schedule.loanId,
              });
            }

            await this.ledger.recordTransaction(ledgerEntries, tx);

            this.logger.log(
              `Successfully marked RepaymentSchedule ${dto.bill_no} as PAID and updated ledger`,
            );
          } else if (!schedule) {
            this.logger.warn(
              `RepaymentSchedule with id ${dto.bill_no} not found`,
            );
          }
        });
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
