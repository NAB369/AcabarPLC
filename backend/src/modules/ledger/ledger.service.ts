import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface LedgerEntryDto {
  accountId: string;
  accountType:
    | 'LOAN'
    | 'CASH'
    | 'INCOME'
    | 'LIABILITY'
    | 'FEE_INCOME'
    | 'INTEREST_INCOME'
    | 'PROVISION';
  debit?: number;
  credit?: number;
  transactionReference: string;
  description?: string;
}

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Appends an entry to the immutable ledger.
   * Banking rule: Never update or delete an entry after creation.
   */
  async recordTransaction(entries: LedgerEntryDto[], txClient?: any) {
    const client = txClient || this.prisma;
    try {
      // In a real banking system, debit and credit should always balance to 0 for a transaction reference.
      // We will perform a multi-insert.
      await client.ledgerEntry.createMany({
        data: entries.map((entry) => ({
          accountId: entry.accountId,
          accountType: entry.accountType,
          debit: entry.debit || 0,
          credit: entry.credit || 0,
          transactionReference: entry.transactionReference,
          description: entry.description,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error('Ledger record failed:', error);
      throw new InternalServerErrorException(
        'Failed to record ledger entry: ' + error.message,
      );
    }
  }

  /**
   * Get the net balance for an account (sum of debits minus sum of credits).
   */
  async getAccountBalance(accountId: string) {
    const result = await this.prisma.ledgerEntry.aggregate({
      where: { accountId },
      _sum: { debit: true, credit: true },
    });

    const totalDebit = Number(result._sum.debit) || 0;
    const totalCredit = Number(result._sum.credit) || 0;

    return {
      accountId,
      totalDebit,
      totalCredit,
      netBalance: totalDebit - totalCredit,
    };
  }

  /**
   * Get all ledger entries for a specific account.
   */
  async getAccountEntries(accountId: string) {
    return this.prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
