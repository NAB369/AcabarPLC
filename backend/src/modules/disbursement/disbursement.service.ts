import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { BakongClient } from './bakong.client';
import { randomUUID } from 'crypto';

@Injectable()
export class DisbursementService {
  private bakong = new BakongClient();

  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  /**
   * Disburse a loan that has been approved.
   * 1. Validate loan is in PENDING_DISBURSEMENT status
   * 2. Initiate Bakong transfer (or cash)
   * 3. Record double-entry ledger
   * 4. Update loan status to DISBURSED
   */
  async disburse(
    loanId: string,
    method: 'BAKONG' | 'CASH' | 'BANK_TRANSFER' = 'BAKONG',
  ) {
    const state = await this.prisma.systemState.findUnique({ where: { id: 'default' } });
    if (state && !state.isOpen) {
      throw new BadRequestException('Disbursement blocked: The business day is currently CLOSED. Please start a new day first.');
    }

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { customer: true },
      });

      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status !== 'PENDING_DISBURSEMENT') {
        throw new BadRequestException(
          `Loan must be in PENDING_DISBURSEMENT status. Current: ${loan.status}`,
        );
      }

      let disbursementRef = `DISB-${randomUUID()}`;

      // Initiate transfer based on method
      if (method === 'BAKONG') {
        const transferResult = await this.bakong.transfer({
          accountId: loan.customer.phone,
          amount: Number(loan.principalAmount),
          currency: (loan.currency as 'USD' | 'KHR') || 'USD',
          description: `Loan disbursement ${loanId}`,
        });
        disbursementRef = transferResult.transactionHash;
      }

      // Update loan status to DISBURSED
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

      // Auto-approve KYC for customer when loan is disbursed —
      // a customer who has passed underwriting and reached disbursement
      // is implicitly KYC-verified. Only upgrade from PENDING; never
      // downgrade an already-APPROVED or override a REJECTED status.
      if (loan.customer.kycStatus === 'PENDING') {
        await tx.customer.update({
          where: { id: loan.customer.id },
          data: { kycStatus: 'APPROVED' },
        });
      }

      // Double-entry ledger: Credit CASH, Debit LOAN (creating asset)
      const txReference = `DISB-${randomUUID()}`;
      await this.ledger.recordTransaction(
        [
          {
            accountId: 'CASH-VAULT',
            accountCode: '10100', // Cash Vault (USD)
            accountType: 'CASH',
            credit: Number(loan.principalAmount),
            transactionReference: txReference,
            description: `Loan disbursement for ${loanId} via ${method}`,
            loanId: loanId,
          },
          {
            accountId: loanId,
            accountCode: '12100', // Loan Portfolio
            accountType: 'LOAN',
            debit: Number(loan.principalAmount),
            transactionReference: txReference,
            description: `Principal disbursed to ${loan.customer.firstName} ${loan.customer.lastName}`,
            loanId: loanId,
          },
        ],
        tx,
      );

      return {
        success: true,
        loan: updatedLoan,
        disbursementRef,
        transactionReference: txReference,
        method,
      };
    });
  }

  /**
   * Generate a KHQR code for a customer to make a repayment.
   */
  async generateRepaymentKhqr(loanId: string, installmentNumber: number) {
    const schedule = await this.prisma.repaymentSchedule.findUnique({
      where: {
        loanId_installmentNumber: { loanId, installmentNumber },
      },
    });

    if (!schedule) throw new NotFoundException('Repayment schedule not found');

    return this.bakong.generateKhqr(
      Number(schedule.amountDue),
      'USD',
      `Loan ${loanId} - Installment #${installmentNumber}`,
    );
  }
}
