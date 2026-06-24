import { IsString, IsNumber, IsOptional, IsNotEmpty, IsIn, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCollateralDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  estimatedValue: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentIds?: string[];
}

export class CreateDraftDto {
  @IsString()
  @IsOptional()
  lid?: string;

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
  currency?: string;

  @IsString()
  @IsOptional()
  applicationChannel?: string;

  @IsString()
  @IsOptional()
  loanOfficerId?: string;

  // Loan term details
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

  @IsBoolean()
  @IsOptional()
  excludeWeekends?: boolean;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCollateralDto)
  @IsOptional()
  collaterals?: AddCollateralDto[];
}

export class SubmitApplicationDto {
  // No body needed — just validates docs are complete
}

export class ReviewDecisionDto {
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'ESCALATED'])
  decision: 'APPROVED' | 'REJECTED' | 'ESCALATED';

  @IsString()
  @IsOptional()
  comments?: string;
}

export class AddGuarantorDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;
}
