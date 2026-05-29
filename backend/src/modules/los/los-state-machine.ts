/**
 * LOS State Machine
 *
 * Pure-function module defining all allowed transitions in
 * the Loan Origination pipeline. No side-effects — this module
 * is solely responsible for answering "can this transition happen?"
 */

export type LoanStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'KYC_REVIEW'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'CREDIT_CHECK'
  | 'UNDERWRITING'
  | 'TIER1_REVIEW'
  | 'TIER2_REVIEW'
  | 'TIER3_REVIEW'
  | 'APPROVED'
  | 'AUTO_REJECTED'
  | 'REJECTED'
  | 'PENDING_DISBURSEMENT'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'DEFAULTED';

export interface TransitionResult {
  allowed: boolean;
  reason?: string;
}

const TRANSITIONS: Record<string, LoanStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['KYC_REVIEW'],
  KYC_REVIEW: ['KYC_APPROVED', 'KYC_REJECTED'],
  KYC_APPROVED: ['CREDIT_CHECK'],
  CREDIT_CHECK: ['UNDERWRITING'],
  UNDERWRITING: ['TIER1_REVIEW', 'AUTO_REJECTED'],
  TIER1_REVIEW: ['APPROVED', 'REJECTED', 'TIER2_REVIEW'],
  TIER2_REVIEW: ['APPROVED', 'REJECTED', 'TIER3_REVIEW'],
  TIER3_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PENDING_DISBURSEMENT'],
  PENDING_DISBURSEMENT: ['DISBURSED'],
  DISBURSED: ['ACTIVE'],
  ACTIVE: ['COMPLETED', 'OVERDUE'],
  OVERDUE: ['ACTIVE', 'DEFAULTED'],
};

/**
 * Check whether a transition from one status to another is allowed.
 */
export function canTransition(
  from: LoanStatus,
  to: LoanStatus,
): TransitionResult {
  const allowed = TRANSITIONS[from]?.includes(to) ?? false;
  return {
    allowed,
    reason: allowed
      ? undefined
      : `Transition from ${from} to ${to} is not allowed`,
  };
}

/**
 * Determine the initial approval tier based on loan amount (USD).
 *   < $500  → TIER1 (Loan Officer)
 *   < $5000 → TIER2 (Branch Manager)
 *   ≥ $5000 → TIER3 (Credit Committee)
 */
export function getNextApprovalTier(
  amount: number,
): 'TIER1_REVIEW' | 'TIER2_REVIEW' | 'TIER3_REVIEW' {
  if (amount < 500) return 'TIER1_REVIEW';
  if (amount < 5000) return 'TIER2_REVIEW';
  return 'TIER3_REVIEW';
}
