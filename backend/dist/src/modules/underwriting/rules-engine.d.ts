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
export declare function evaluate(input: UnderwritingInput): UnderwritingDecision;
