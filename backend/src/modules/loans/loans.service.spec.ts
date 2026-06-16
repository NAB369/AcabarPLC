import { Test, TestingModule } from '@nestjs/testing';
import { LoansService, CreateLoanDto } from './loans.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// ============================================================
// Mock factories
// ============================================================
const mockLoanProduct = (overrides = {}) => ({
  id: 'prod-1',
  name: 'Personal Loan',
  description: 'Test product',
  minAmount: 100,
  maxAmount: 50000,
  baseInterestRate: 12,
  interestType: 'FLAT',
  createdAt: new Date(),
  ...overrides,
});

const mockLoan = (overrides = {}) => ({
  id: 'loan-1',
  customerId: 'cust-1',
  productId: 'prod-1',
  principalAmount: 5000,
  interestRate: 12,
  durationMonths: 12,
  status: 'PENDING',
  disbursedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ============================================================
// Prisma mock
// ============================================================
const createMockPrisma = () => ({
  loanProduct: {
    findUnique: jest.fn(),
  },
  loan: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  repaymentSchedule: {
    createMany: jest.fn(),
  },
  $transaction: jest.fn((cb: (tx: any) => Promise<any>) =>
    cb({
      loan: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      loanProduct: {
        findUnique: jest.fn(),
      },
      repaymentSchedule: {
        createMany: jest.fn().mockResolvedValue({ count: 12 }),
      },
    }),
  ),
});

const createMockLedger = () => ({
  recordTransaction: jest.fn().mockResolvedValue({ success: true }),
});

describe('LoansService', () => {
  let service: LoansService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let ledger: ReturnType<typeof createMockLedger>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    ledger = createMockLedger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: PrismaService, useValue: prisma },
        { provide: LedgerService, useValue: ledger },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  // ==========================================================
  // applyForLoan
  // ==========================================================
  describe('applyForLoan', () => {
    const dto: CreateLoanDto = {
      customerId: 'cust-1',
      productId: 'prod-1',
      principalAmount: 5000,
      durationMonths: 12,
    };

    it('should create a loan with PENDING status and generate FLAT schedules', async () => {
      const product = mockLoanProduct({ interestType: 'FLAT' });
      const loan = mockLoan();

      prisma.loanProduct.findUnique.mockResolvedValue(product);
      prisma.loan.create.mockResolvedValue(loan);
      prisma.repaymentSchedule.createMany.mockResolvedValue({ count: 12 });

      const result = await service.applyForLoan(dto);

      expect(result.loan).toBeDefined();
      expect(result.schedules).toHaveLength(12);
      expect(prisma.loan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });

    it('should generate REDUCING balance schedules with decreasing interest', async () => {
      const product = mockLoanProduct({
        interestType: 'REDUCING',
        baseInterestRate: 12,
      });
      const loan = mockLoan();

      prisma.loanProduct.findUnique.mockResolvedValue(product);
      prisma.loan.create.mockResolvedValue(loan);
      prisma.repaymentSchedule.createMany.mockResolvedValue({ count: 12 });

      const result = await service.applyForLoan(dto);

      // In reducing balance, interest component should decrease over time
      const firstInstallment = result.schedules[0];
      const lastInstallment = result.schedules[result.schedules.length - 1];
      expect(firstInstallment.interestComponent).toBeGreaterThan(
        lastInstallment.interestComponent,
      );

      // All EMIs should be equal (constant payment)
      const allAmounts = result.schedules.map((s: any) =>
        Math.round(s.amountDue * 100),
      );
      expect(new Set(allAmounts).size).toBe(1);
    });

    it('should throw NotFoundException when loan product does not exist', async () => {
      prisma.loanProduct.findUnique.mockResolvedValue(null);

      await expect(service.applyForLoan(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.applyForLoan(dto)).rejects.toThrow(
        'Loan Product not found',
      );
    });

    it('should throw BadRequestException when amount is below product minimum', async () => {
      const product = mockLoanProduct({ minAmount: 10000 });
      prisma.loanProduct.findUnique.mockResolvedValue(product);

      await expect(service.applyForLoan(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.applyForLoan(dto)).rejects.toThrow(
        'Amount out of product bounds',
      );
    });

    it('should throw BadRequestException when amount exceeds product maximum', async () => {
      const product = mockLoanProduct({ maxAmount: 1000 });
      prisma.loanProduct.findUnique.mockResolvedValue(product);

      await expect(service.applyForLoan(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid interest type', async () => {
      const product = mockLoanProduct({ interestType: 'INVALID_TYPE' });
      const loan = mockLoan();

      prisma.loanProduct.findUnique.mockResolvedValue(product);
      prisma.loan.create.mockResolvedValue(loan);

      await expect(service.applyForLoan(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.applyForLoan(dto)).rejects.toThrow(
        'Invalid interest type',
      );
    });

    it('should correctly calculate FLAT interest totals', async () => {
      const product = mockLoanProduct({
        interestType: 'FLAT',
        baseInterestRate: 12,
      });
      const loan = mockLoan({ principalAmount: 12000 });

      prisma.loanProduct.findUnique.mockResolvedValue(product);
      prisma.loan.create.mockResolvedValue(loan);
      prisma.repaymentSchedule.createMany.mockResolvedValue({ count: 12 });

      const dtoFull = { ...dto, principalAmount: 12000, durationMonths: 12 };
      const result = await service.applyForLoan(dtoFull);

      // FLAT: totalInterest = 12000 * 0.12 * (12/12) = 1440
      // monthlyInterest = 1440 / 12 = 120
      // monthlyPrincipal = 12000 / 12 = 1000
      // amountDue = 1120
      const schedule = result.schedules[0];
      expect(schedule.principalComponent).toBeCloseTo(1000);
      expect(schedule.interestComponent).toBeCloseTo(120);
      expect(schedule.amountDue).toBeCloseTo(1120);
    });

    it('should generate correct number of installments matching duration', async () => {
      const product = mockLoanProduct({ interestType: 'FLAT' });
      const loan = mockLoan();

      prisma.loanProduct.findUnique.mockResolvedValue(product);
      prisma.loan.create.mockResolvedValue(loan);
      prisma.repaymentSchedule.createMany.mockResolvedValue({ count: 24 });

      const dto24 = { ...dto, durationMonths: 24 };
      const result = await service.applyForLoan(dto24);

      expect(result.schedules).toHaveLength(24);
      expect(result.schedules[0].installmentNumber).toBe(1);
      expect(result.schedules[23].installmentNumber).toBe(24);
    });

    it('should set all schedule statuses to PENDING', async () => {
      const product = mockLoanProduct({ interestType: 'FLAT' });
      const loan = mockLoan();

      prisma.loanProduct.findUnique.mockResolvedValue(product);
      prisma.loan.create.mockResolvedValue(loan);
      prisma.repaymentSchedule.createMany.mockResolvedValue({ count: 12 });

      const result = await service.applyForLoan(dto);

      result.schedules.forEach((s: any) => {
        expect(s.status).toBe('PENDING');
      });
    });
  });

  // ==========================================================
  // approveLoan
  // ==========================================================
  describe('approveLoan', () => {
    it('should update loan status to APPROVED', async () => {
      const approvedLoan = mockLoan({ status: 'APPROVED' });
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: {
            findUnique: jest.fn(),
            update: jest.fn().mockResolvedValue(approvedLoan),
          },
          loanProduct: { findUnique: jest.fn() },
          repaymentSchedule: { createMany: jest.fn().mockResolvedValue({ count: 0 }) },
        };
        return cb(tx);
      });

      const result = await service.approveLoan('loan-1');

      expect(result.status).toBe('APPROVED');
    });
  });

  // ==========================================================
  // disburseLoan
  // ==========================================================
  describe('disburseLoan', () => {
    it('should disburse an APPROVED loan and record double-entry ledger', async () => {
      const loan = mockLoan({ status: 'APPROVED' });
      const disbursedLoan = mockLoan({
        status: 'DISBURSED',
        disbursedAt: new Date(),
      });

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: {
            findUnique: jest.fn().mockResolvedValue(loan),
            update: jest.fn().mockResolvedValue(disbursedLoan),
          },
          loanProduct: {
            findUnique: jest.fn().mockResolvedValue(mockLoanProduct()),
          },
          repaymentSchedule: {
            createMany: jest.fn().mockResolvedValue({ count: 12 }),
          },
        };
        return cb(tx);
      });

      const result = await service.disburseLoan('loan-1');

      expect(result.success).toBe(true);
      expect(result.loan.status).toBe('DISBURSED');
      expect(result.transactionReference).toMatch(/^DISB-/);

      // Verify ledger was called with 2 entries (double-entry)
      expect(ledger.recordTransaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            accountId: 'CASH-VAULT',
            accountType: 'CASH',
          }),
          expect.objectContaining({ accountId: 'loan-1', accountType: 'LOAN' }),
        ]),
      );
    });

    it('should throw NotFoundException when loan does not exist', async () => {
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(null) },
          loanProduct: { findUnique: jest.fn() },
          repaymentSchedule: { createMany: jest.fn() },
        };
        return cb(tx);
      });

      await expect(service.disburseLoan('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when loan is not APPROVED', async () => {
      const pendingLoan = mockLoan({ status: 'PENDING' });

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(pendingLoan) },
          loanProduct: { findUnique: jest.fn() },
          repaymentSchedule: { createMany: jest.fn() },
        };
        return cb(tx);
      });

      await expect(service.disburseLoan('loan-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.disburseLoan('loan-1')).rejects.toThrow(
        'Loan must be APPROVED before disbursement',
      );
    });

    it('should not record ledger entries when loan status is invalid', async () => {
      const pendingLoan = mockLoan({ status: 'PENDING' });

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          loan: { findUnique: jest.fn().mockResolvedValue(pendingLoan) },
          loanProduct: { findUnique: jest.fn() },
          repaymentSchedule: { createMany: jest.fn() },
        };
        return cb(tx);
      });

      try {
        await service.disburseLoan('loan-1');
      } catch {
        // expected
      }

      expect(ledger.recordTransaction).not.toHaveBeenCalled();
    });
  });
});
