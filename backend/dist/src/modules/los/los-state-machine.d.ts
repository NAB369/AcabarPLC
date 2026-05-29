export type LoanStatus = 'DRAFT' | 'SUBMITTED' | 'KYC_REVIEW' | 'KYC_APPROVED' | 'KYC_REJECTED' | 'CREDIT_CHECK' | 'UNDERWRITING' | 'TIER1_REVIEW' | 'TIER2_REVIEW' | 'TIER3_REVIEW' | 'APPROVED' | 'AUTO_REJECTED' | 'REJECTED' | 'PENDING_DISBURSEMENT' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'DEFAULTED';
export interface TransitionResult {
    allowed: boolean;
    reason?: string;
}
export declare function canTransition(from: LoanStatus, to: LoanStatus): TransitionResult;
export declare function getNextApprovalTier(amount: number): 'TIER1_REVIEW' | 'TIER2_REVIEW' | 'TIER3_REVIEW';
