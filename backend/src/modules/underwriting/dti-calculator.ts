/**
 * Debt-to-Income (DTI) Calculator
 *
 * Calculates the DTI ratio used by NBC-regulated lenders in Cambodia.
 * DTI = (existingMonthlyDebt + proposedMonthlyPayment) / monthlyIncome
 */

export interface DtiInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingLoanPayments: number; // From CBC: sum of existing EMIs
  proposedEmi: number; // EMI for the loan being applied for
}

export interface DtiResult {
  dtiRatio: number;
  dtiPercentage: number;
  disposableIncome: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export function calculateDti(input: DtiInput): DtiResult {
  if (input.monthlyIncome <= 0) {
    return {
      dtiRatio: Infinity,
      dtiPercentage: Infinity,
      disposableIncome: -input.existingLoanPayments - input.proposedEmi,
      riskLevel: 'CRITICAL',
    };
  }

  const totalDebtPayments = input.existingLoanPayments + input.proposedEmi;
  const dtiRatio = totalDebtPayments / input.monthlyIncome;
  const dtiPercentage = Math.round(dtiRatio * 10000) / 100;
  const disposableIncome =
    input.monthlyIncome - input.monthlyExpenses - totalDebtPayments;

  let riskLevel: DtiResult['riskLevel'];
  if (dtiRatio <= 0.35) riskLevel = 'LOW';
  else if (dtiRatio <= 0.5) riskLevel = 'MODERATE';
  else if (dtiRatio <= 0.7) riskLevel = 'HIGH';
  else riskLevel = 'CRITICAL';

  return { dtiRatio, dtiPercentage, disposableIncome, riskLevel };
}
