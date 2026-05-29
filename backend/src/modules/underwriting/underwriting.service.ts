import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CbcClient } from './cbc.client';
import { calculateDti, DtiInput, DtiResult } from './dti-calculator';
import {
  evaluate,
  UnderwritingInput,
  UnderwritingDecision,
} from './rules-engine';

@Injectable()
export class UnderwritingService {
  private cbcClient = new CbcClient();

  constructor(private prisma: PrismaService) {}

  /**
   * Run a full credit check for a loan application:
   *  1. Query CBC using customer's National ID
   *  2. Store CreditReport
   *  3. Calculate DTI ratio
   *  4. Run rules engine
   *  5. Return decision
   */
  async evaluateLoan(loanId: string): Promise<{
    decision: UnderwritingDecision;
    dti: DtiResult;
    cbcScore: number | null;
  }> {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        customer: true,
        product: true,
      },
    });

    if (!loan) throw new Error('Loan not found');

    // 1. Query CBC
    const cbcReport = await this.cbcClient.queryCredit(
      loan.customer.nationalId || 'UNKNOWN',
    );

    // 2. Store CreditReport
    await this.prisma.creditReport.create({
      data: {
        customerId: loan.customerId,
        loanId: loan.id,
        cbcScore: cbcReport.cbcScore,
        totalExposure: cbcReport.totalExposure,
        activeLoans: cbcReport.activeLoans,
        delinquencyFlag: cbcReport.delinquencyFlag,
        reportData: cbcReport.reportData as any,
      },
    });

    // 3. Calculate DTI
    const monthlyIncome = Number(loan.customer.monthlyIncome) || 0;
    const monthlyExpenses = Number(loan.customer.monthlyExpenses) || 0;

    // Estimate proposed EMI (simple flat calculation for decisioning)
    const annualRate = Number(loan.interestRate);
    const monthlyRate = annualRate / 100 / 12;
    const months = loan.durationMonths;
    const principal = Number(loan.principalAmount);
    let proposedEmi: number;

    if (loan.product.interestType === 'FLAT') {
      const totalInterest = principal * (annualRate / 100) * (months / 12);
      proposedEmi = (principal + totalInterest) / months;
    } else {
      // REDUCING balance EMI
      proposedEmi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const dtiInput: DtiInput = {
      monthlyIncome,
      monthlyExpenses,
      existingLoanPayments:
        Number(cbcReport.totalExposure) > 0
          ? Number(cbcReport.totalExposure) / 12 // rough monthly estimate
          : 0,
      proposedEmi,
    };

    const dti = calculateDti(dtiInput);

    // 4. Run rules engine
    const underwritingInput: UnderwritingInput = {
      principalAmount: principal,
      annualInterestRate: annualRate,
      cbcScore: cbcReport.cbcScore,
      delinquencyFlag: cbcReport.delinquencyFlag,
      dtiRatio: dti.dtiRatio,
      totalExposure: cbcReport.totalExposure,
      monthlyIncome,
    };

    const decision = evaluate(underwritingInput);

    // 5. Cache scores on the loan record
    await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        dtiRatio: dti.dtiRatio,
        cbcScore: cbcReport.cbcScore,
      },
    });

    return { decision, dti, cbcScore: cbcReport.cbcScore };
  }
}
