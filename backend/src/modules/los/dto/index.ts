export class CreateDraftDto {
  lid?: string;
  customerId: string;
  productId: string;
  principalAmount: number;
  durationMonths: number;
  currency?: string;
  applicationChannel?: string;
  loanOfficerId?: string;

  // Loan term details
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

export class SubmitApplicationDto {
  // No body needed — just validates docs are complete
}

export class ReviewDecisionDto {
  decision: 'APPROVED' | 'REJECTED' | 'ESCALATED';
  comments?: string;
}

export class AddCollateralDto {
  type: string;
  description: string;
  estimatedValue: number;
  currency?: string;
  documentIds?: string[];
}

export class AddGuarantorDto {
  firstName: string;
  lastName: string;
  nationalId?: string;
  phone: string;
  relationship: string;
}
