import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  principalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  durationMonths: number;

  @IsString()
  @IsOptional()
  lid?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  applicationChannel?: string;

  @IsString()
  @IsOptional()
  loanOfficerId?: string;

  @IsString()
  @IsOptional()
  disbursementDate?: string;

  @IsString()
  @IsOptional()
  repaymentType?: string;

  @IsString()
  @IsOptional()
  firstInstallmentDate?: string;

  @IsNumber()
  @IsOptional()
  numberOfInstallments?: number;

  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @IsNumber()
  @IsOptional()
  penaltyRate?: number;

  @IsNumber()
  @IsOptional()
  adminFeeRate?: number;

  @IsString()
  @IsOptional()
  collectionFeeType?: string;

  @IsNumber()
  @IsOptional()
  collectionFeeValue?: number;

  @IsNumber()
  @IsOptional()
  gracePeriod?: number;

  @IsNumber()
  @IsOptional()
  refinanceFeeAmt?: number;

  @IsNumber()
  @IsOptional()
  reminderPreference?: number;

  @IsString()
  @IsOptional()
  loanCycle?: string;

  @IsString()
  @IsOptional()
  recommenderType?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  reasonOfCredit?: string;

  @IsString()
  @IsOptional()
  loanNote?: string;

  @IsString()
  @IsOptional()
  memoReasonOfCredit?: string;

  @IsOptional()
  collaterals?: any;
}
