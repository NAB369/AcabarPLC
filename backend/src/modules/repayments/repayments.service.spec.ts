import { Test, TestingModule } from '@nestjs/testing';
import { RepaymentsService, ProcessRepaymentDto } from './repayments.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// ============================================================
// Mock factories
// ============================================================
const mockLoan = (overrides = {}) => ({
  id: 'loan-1',
  customerId: 'cust-1',
  productId: 'prod-1',
  principalAmount: 12000,
  interestRate: 12,
  durationMonths: 12,
  status: 'DISBURSED',
  ...overrides,
});

const mockSchedule = (overrides = {}) => ({
  id: 'sched-1',
  loanId: 'loan-1',
  installmentNumber: 1,
  amountDue: 1120,
  principalComponent: 1000,
  interestComponent: 120,
  dueDate: new Date(),
  status: 'PENDING',
  ...overrides,
});

// ============================================================
// Prisma mock with transaction support
// ============================================================
const createMockPrisma = () => ({
  $transaction: jest.fn(),
});

const createMockLedger = () => ({
  recordTransaction: jest.fn().mockResolvedValue({ success: true }),
});

describe('RepaymentsService', () => {
  let service: RepaymentsService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let ledger: ReturnType<typeof createMockLedger>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    ledger = createMockLedger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: LedgerService, useValue: ledger },
      ],
    }).compile();

    service = module.get<RepaymentsService>(RepaymentsService);
  });

  describe('processRepayment', () => {
    const dto: ProcessRepaymentDto = {
      loanId: 'loan-1',
      amount: 1120,
      paymentMethod: 'KHQR',
    };

    it('should process a full repayment and mark schedule as PAID', async () => {
      const loan = mockLoan();
      const schedule = mockSchedule({ amountDue: 1120 });

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(loan) },
          repaymentSchedule: {
            findFirst: jest.fn().mockResolvedValue(schedule),
            update: jest
              .fn()
              .mockResolvedValue({ ...schedule, status: 'PAID' }),
          },
        };
        return cb(tx);
      });

      const result = await service.processRepayment(dto);

      expect(result.success).toBe(true);
      expect(result.transactionReference).toMatch(/^REP-/);
    });

    it('should mark schedule as PARTIAL when amount is less than due', async () => {
      const loan = mockLoan();
      const schedule = mockSchedule({ amountDue: 1120 });

      let capturedUpdateData: any;

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(loan) },
          repaymentSchedule: {
            findFirst: jest.fn().mockResolvedValue(schedule),
            update: jest.fn().mockImplementation(({ data }) => {
              capturedUpdateData = data;
              return { ...schedule, ...data };
            }),
          },
        };
        return cb(tx);
      });

      const partialDto = { ...dto, amount: 500 };
      await service.processRepayment(partialDto);

      expect(capturedUpdateData.status).toBe('PARTIAL');
    });

    it('should record double-entry ledger (debit CASH, credit LOAN)', async () => {
      const loan = mockLoan();
      const schedule = mockSchedule();

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(loan) },
          repaymentSchedule: {
            findFirst: jest.fn().mockResolvedValue(schedule),
            update: jest
              .fn()
              .mockResolvedValue({ ...schedule, status: 'PAID' }),
          },
        };
        return cb(tx);
      });

      await service.processRepayment(dto);

      expect(ledger.recordTransaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            accountId: 'CASH-VAULT',
            accountType: 'CASH',
            debit: 1120,
          }),
          expect.objectContaining({
            accountId: 'loan-1',
            accountType: 'LOAN',
            credit: 1120,
          }),
        ]),
      );
    });

    it('should throw NotFoundException when loan does not exist', async () => {
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(null) },
        };
        return cb(tx);
      });

      await expect(service.processRepayment(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when no pending schedule exists', async () => {
      const loan = mockLoan();

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(loan) },
          repaymentSchedule: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
        };
        return cb(tx);
      });

      await expect(service.processRepayment(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.processRepayment(dto)).rejects.toThrow(
        'No pending repayment schedule found for this loan',
      );
    });

    it('should include payment method in the ledger description', async () => {
      const loan = mockLoan();
      const schedule = mockSchedule();

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(loan) },
          repaymentSchedule: {
            findFirst: jest.fn().mockResolvedValue(schedule),
            update: jest
              .fn()
              .mockResolvedValue({ ...schedule, status: 'PAID' }),
          },
        };
        return cb(tx);
      });

      await service.processRepayment({ ...dto, paymentMethod: 'BAKONG' });

      expect(ledger.recordTransaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            description: expect.stringContaining('BAKONG'),
          }),
        ]),
      );
    });
  });
});
