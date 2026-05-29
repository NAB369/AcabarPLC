export interface DtiInput {
    monthlyIncome: number;
    monthlyExpenses: number;
    existingLoanPayments: number;
    proposedEmi: number;
}
export interface DtiResult {
    dtiRatio: number;
    dtiPercentage: number;
    disposableIncome: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}
export declare function calculateDti(input: DtiInput): DtiResult;
