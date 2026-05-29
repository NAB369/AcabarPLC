/**
 * Underwriting Rules Engine
 *
 * Automated decision-making for Cambodian loan origination.
 * Enforces NBC regulations (18% cap, CBC checks, DTI limits).
 */

export interface UnderwritingInput {
  principalAmount: number;
  annualInterestRate: number;
  cbcScore: number | null;
  delinquencyFlag: boolean;
  dtiRatio: number;
  totalExposure: number;
  monthlyIncome: number;
}

export interface UnderwritingDecision {
  decision: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'AUTO_REJECT';
  tier?: 'TIER1_REVIEW' | 'TIER2_REVIEW' | 'TIER3_REVIEW';
  reasons: string[];
}

export function evaluate(input: UnderwritingInput): UnderwritingDecision {
  const reasons: string[] = [];

  // NBC hard block — interest rate cap for MFIs
  if (input.annualInterestRate > 18) {
    reasons.push('Interest rate exceeds NBC cap of 18%');
    return { decision: 'AUTO_REJECT', reasons };
  }

  // CBC-based rejections
  if (input.cbcScore !== null && input.cbcScore < 300) {
    reasons.push('CBC score below minimum threshold (300)');
  }

  if (input.delinquencyFlag) {
    reasons.push('Active delinquency reported by CBC');
  }

  // DTI check
  if (input.dtiRatio > 0.7) {
    reasons.push('Debt-to-Income ratio exceeds 70%');
  }

  // Auto-reject if any hard fails
  if (reasons.length > 0) {
    return { decision: 'AUTO_REJECT', reasons };
  }

  // Determine approval tier based on amount
  let tier: UnderwritingDecision['tier'];
  if (input.principalAmount < 500) {
    tier = 'TIER1_REVIEW';
  } else if (input.principalAmount < 5000) {
    tier = 'TIER2_REVIEW';
  } else {
    tier = 'TIER3_REVIEW';
  }

  // Warning flags — still goes to manual review, but flagged
  if (input.dtiRatio > 0.5) {
    reasons.push('DTI ratio above 50% — requires careful review');
  }
  if (input.cbcScore !== null && input.cbcScore < 500) {
    reasons.push('CBC score is below recommended threshold (500)');
  }

  return { decision: 'MANUAL_REVIEW', tier, reasons };
}
