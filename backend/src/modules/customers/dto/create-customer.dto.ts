import { IsString, IsOptional, IsNumber, IsNotEmpty, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  cid?: string;

  @IsString()
  @IsOptional()
  khmerFirstName?: string;

  @IsString()
  @IsOptional()
  khmerLastName?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  passport?: string;

  @IsString()
  @IsOptional()
  familyBook?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  employerName?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  monthlyIncome?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  monthlyIncomeKhr?: number;

  @IsString()
  @IsOptional()
  businessInfo?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  incomeBracket?: string;

  @IsString()
  @IsOptional()
  dependentCount?: string;

  @IsString()
  @IsOptional()
  incomeMaker?: string;

  @IsString()
  @IsOptional()
  coBorrowerName?: string;

  @IsString()
  @IsOptional()
  coBorrowerKhmerName?: string;

  @IsString()
  @IsOptional()
  coBorrowerPhone?: string;

  @IsString()
  @IsOptional()
  coBorrowerNationalId?: string;

  @IsString()
  @IsOptional()
  guarantorName?: string;

  @IsString()
  @IsOptional()
  guarantorKhmerName?: string;

  @IsString()
  @IsOptional()
  guarantorPhone?: string;

  @IsString()
  @IsOptional()
  guarantorNationalId?: string;

  @IsString()
  @IsOptional()
  guarantorRelationship?: string;
}

export class UpdateKycStatusDto {
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  cid?: string;

  @IsString()
  @IsOptional()
  khmerFirstName?: string;

  @IsString()
  @IsOptional()
  khmerLastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  passport?: string;

  @IsString()
  @IsOptional()
  familyBook?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  employerName?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  monthlyIncome?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  monthlyIncomeKhr?: number;

  @IsString()
  @IsOptional()
  businessInfo?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  incomeBracket?: string;

  @IsString()
  @IsOptional()
  dependentCount?: string;

  @IsString()
  @IsOptional()
  incomeMaker?: string;

  @IsString()
  @IsOptional()
  coBorrowerName?: string;

  @IsString()
  @IsOptional()
  coBorrowerKhmerName?: string;

  @IsString()
  @IsOptional()
  coBorrowerPhone?: string;

  @IsString()
  @IsOptional()
  coBorrowerNationalId?: string;

  @IsString()
  @IsOptional()
  guarantorName?: string;

  @IsString()
  @IsOptional()
  guarantorKhmerName?: string;

  @IsString()
  @IsOptional()
  guarantorPhone?: string;

  @IsString()
  @IsOptional()
  guarantorNationalId?: string;

  @IsString()
  @IsOptional()
  guarantorRelationship?: string;
}
