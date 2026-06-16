export declare class CreateDraftDto {
    lid?: string;
    customerId: string;
    productId: string;
    principalAmount: number;
    durationMonths: number;
    currency?: string;
    applicationChannel?: string;
    loanOfficerId?: string;
    disbursementDate?: string;
    repaymentType?: string;
    firstInstallmentDate?: string;
    numberOfInstallments?: number;
    interestRate?: number;
    penaltyRate?: number;
    adminFeeRate?: number;
    collectionFeeType?: string;
    collectionFeeValue?: number;
    gracePeriod?: number;
    refinanceFeeAmt?: number;
    reminderPreference?: number;
    loanCycle?: string;
    recommenderType?: string;
    branchId?: string;
    reasonOfCredit?: string;
    loanNote?: string;
    memoReasonOfCredit?: string;
    collaterals?: AddCollateralDto[];
}
export declare class SubmitApplicationDto {
}
export declare class ReviewDecisionDto {
    decision: 'APPROVED' | 'REJECTED' | 'ESCALATED';
    comments?: string;
}
export declare class AddCollateralDto {
    type: string;
    description: string;
    estimatedValue: number;
    currency?: string;
    documentIds?: string[];
}
export declare class AddGuarantorDto {
    firstName: string;
    lastName: string;
    nationalId?: string;
    phone: string;
    relationship: string;
}
