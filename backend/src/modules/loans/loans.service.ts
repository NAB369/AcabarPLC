import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { randomUUID } from 'crypto';

export class CreateLoanDto {
  customerId: string;
  productId: string;
  principalAmount: number;
  durationMonths: number;
}

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async applyForLoan(createLoanDto: CreateLoanDto) {
    const { customerId, productId, principalAmount, durationMonths } =
      createLoanDto;

    const product = await this.prisma.loanProduct.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Loan Product not found');

    if (
      principalAmount < Number(product.minAmount) ||
      principalAmount > Number(product.maxAmount)
    ) {
      throw new BadRequestException('Amount out of product bounds');
    }

    // 1. Create the loan record
    const loan = await this.prisma.loan.create({
      data: {
        customerId,
        productId,
        principalAmount,
        interestRate: product.baseInterestRate,
        durationMonths,
        status: 'PENDING',
      },
    });

    return { loan, schedules: [] };
  }

  async disburseLoan(loanId: string) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status !== 'APPROVED')
        throw new BadRequestException(
          'Loan must be APPROVED before disbursement',
        );

      const product = await tx.loanProduct.findUnique({ where: { id: loan.productId } });
      if (!product) throw new NotFoundException('Loan Product not found');

      // Update loan status
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: 'DISBURSED',
          disbursedAt: new Date(),
        },
      });

      // Generate repayment schedule
      const schedules = this.generateRepaymentSchedule(
        loan.id,
        loan.principalAmount,
        loan.interestRate,
        loan.durationMonths,
        product.interestType,
      );

      // Save schedules
      await tx.repaymentSchedule.createMany({ data: schedules });

      const txReference = `DISB-${randomUUID()}`;

      // Record to Immutable Ledger
      // Double-entry: Credit Cash, Debit Loan Account (creating an asset for the bank)
      await this.ledger.recordTransaction([
        {
          accountId: 'CASH-VAULT',
          accountCode: '10100',
          accountType: 'CASH',
          credit: Number(loan.principalAmount),
          transactionReference: txReference,
          description: `Loan disbursement for ${loanId}`,
          loanId: loanId,
        },
        {
          accountId: loanId,
          accountCode: '12100',
          accountType: 'LOAN',
          debit: Number(loan.principalAmount),
          transactionReference: txReference,
          description: `Principal disbursed`,
          loanId: loanId,
        },
      ]);

      return {
        success: true,
        loan: updatedLoan,
        transactionReference: txReference,
      };
    });
  }

  // Approve a loan prior to disbursement
  async approveLoan(loanId: string) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.update({
        where: { id: loanId },
        data: { status: 'APPROVED' }
      });

      return loan;
    });
  }

  private generateRepaymentSchedule(
    loanId: string,
    principal: number,
    annualRate: number,
    months: number,
    type: string,
  ) {
    const schedules = [];
    const monthlyRate = annualRate / 100 / 12;
    let balance = principal;
    const startDate = new Date();

    if (type === 'FLAT') {
      const totalInterest = principal * (annualRate / 100) * (months / 12);
      const monthlyInterest = totalInterest / months;
      const monthlyPrincipal = principal / months;
      const amountDue = monthlyPrincipal + monthlyInterest;

      for (let i = 1; i <= months; i++) {
        startDate.setMonth(startDate.getMonth() + 1);
        schedules.push({
          loanId,
          installmentNumber: i,
          amountDue,
          principalComponent: monthlyPrincipal,
          interestComponent: monthlyInterest,
          dueDate: new Date(startDate),
          status: 'PENDING',
        });
      }
    } else if (type === 'REDUCING') {
      const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

      for (let i = 1; i <= months; i++) {
        startDate.setMonth(startDate.getMonth() + 1);
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = emi - interestForMonth;
        balance -= principalForMonth;

        schedules.push({
          loanId,
          installmentNumber: i,
          amountDue: emi,
          principalComponent: principalForMonth,
          interestComponent: interestForMonth,
          dueDate: new Date(startDate),
          status: 'PENDING',
        });
      }
    } else {
      throw new BadRequestException('Invalid interest type');
    }

    return schedules;
  }

  async findCustomerByEmail(email: string) {
    return this.prisma.customer.findFirst({
      where: { email },
    });
  }

  async getMyActiveLoan(customerId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: {
        customerId,
        status: 'ACTIVE',
      },
      include: {
        repaymentSchedules: {
          orderBy: { dueDate: 'asc' },
          where: { status: 'PENDING' },
          take: 1,
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('No active loan found');
    }

    return loan;
  }

  async getAllProducts() {
    return this.prisma.loanProduct.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(data: any) {
    return this.prisma.loanProduct.create({
      data: {
        name: data.name,
        description: data.description,
        minAmount: Number(data.minAmount),
        maxAmount: Number(data.maxAmount),
        baseInterestRate: Number(data.baseInterestRate),
        interestType: data.interestType,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    return this.prisma.loanProduct.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        minAmount: data.minAmount ? Number(data.minAmount) : undefined,
        maxAmount: data.maxAmount ? Number(data.maxAmount) : undefined,
        baseInterestRate: data.baseInterestRate
          ? Number(data.baseInterestRate)
          : undefined,
        interestType: data.interestType,
      },
    });
  }

  async getProduct(id: string) {
    return this.prisma.loanProduct.findUnique({ where: { id } });
  }

  async calculateCreditScore(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { customer: true }
    });

    if (!loan) throw new NotFoundException('Loan not found');

    let score = 500; // Base score

    // DTI Ratio impact
    if (loan.dtiRatio !== null && loan.dtiRatio !== undefined) {
      if (loan.dtiRatio < 0.3) score += 150;
      else if (loan.dtiRatio <= 0.5) score += 50;
      else score -= 100;
    } else {
      // Missing DTI is a risk
      score -= 50;
    }

    // CBC Score impact (Assuming CBC is roughly 0-850)
    if (loan.cbcScore) {
      if (loan.cbcScore >= 700) score += 200;
      else if (loan.cbcScore >= 600) score += 100;
      else if (loan.cbcScore >= 500) score += 0;
      else score -= 100;
    }

    // Income impact
    const income = loan.customer.monthlyIncome || 0;
    const incomeDollar = income; // Assuming income is stored as dollars
    if (incomeDollar > 2000) score += 150;
    else if (incomeDollar >= 1000) score += 100;
    else if (incomeDollar >= 500) score += 50;

    // Cap score at 1000
    score = Math.min(Math.max(score, 0), 1000);

    let riskBand = 'D (High Risk)';
    if (score >= 800) riskBand = 'A (Excellent)';
    else if (score >= 650) riskBand = 'B (Good)';
    else if (score >= 500) riskBand = 'C (Fair)';

    return this.prisma.loan.update({
      where: { id: loanId },
      data: {
        internalCreditScore: score,
        creditRiskBand: riskBand,
      }
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.loanProduct.delete({ where: { id } });
  }
}
