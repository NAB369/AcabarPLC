import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService, LedgerEntryDto } from './ledger.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

const createMockPrisma = () => ({
  ledgerEntry: {
    createMany: jest.fn().mockResolvedValue({ count: 2 }),
  },
});

describe('LedgerService', () => {
  let service: LedgerService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LedgerService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  describe('recordTransaction', () => {
    const disbursementEntries: LedgerEntryDto[] = [
      {
        accountId: 'CASH-VAULT',
        accountType: 'CASH',
        credit: 5000,
        transactionReference: 'DISB-001',
        description: 'Loan disbursement',
      },
      {
        accountId: 'loan-1',
        accountType: 'LOAN',
        debit: 5000,
        transactionReference: 'DISB-001',
        description: 'Principal disbursed',
      },
    ];

    it('should insert all entries using createMany', async () => {
      const result = await service.recordTransaction(disbursementEntries);

      expect(result).toEqual({ success: true });
      expect(prisma.ledgerEntry.createMany).toHaveBeenCalledTimes(1);
    });

    it('should map entries correctly with defaults for missing debit/credit', async () => {
      const entries: LedgerEntryDto[] = [
        {
          accountId: 'ACC-1',
          accountType: 'CASH',
          credit: 1000,
          // no debit specified
          transactionReference: 'TX-001',
        },
      ];

      await service.recordTransaction(entries);

      expect(prisma.ledgerEntry.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            accountId: 'ACC-1',
            debit: 0,
            credit: 1000,
          }),
        ]),
      });
    });

    it('should throw InternalServerErrorException when database insert fails', async () => {
      prisma.ledgerEntry.createMany.mockRejectedValue(
        new Error('DB connection lost'),
      );

      await expect(
        service.recordTransaction(disbursementEntries),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.recordTransaction(disbursementEntries),
      ).rejects.toThrow('Failed to record ledger entry:');
    });

    it('should handle multiple entries in a single transaction reference', async () => {
      const fourEntries: LedgerEntryDto[] = [
        {
          accountId: 'CASH-VAULT',
          accountType: 'CASH',
          debit: 1000,
          transactionReference: 'REP-001',
        },
        {
          accountId: 'loan-1',
          accountType: 'LOAN',
          credit: 880,
          transactionReference: 'REP-001',
        },
        {
          accountId: 'INTEREST-INCOME',
          accountType: 'INCOME',
          credit: 120,
          transactionReference: 'REP-001',
        },
        {
          accountId: 'PROVISION',
          accountType: 'LIABILITY',
          debit: 0,
          credit: 0,
          transactionReference: 'REP-001',
        },
      ];

      await service.recordTransaction(fourEntries);

      const callArgs = prisma.ledgerEntry.createMany.mock.calls[0][0];
      expect(callArgs.data).toHaveLength(4);
    });
  });
});
