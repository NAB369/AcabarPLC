import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PayloanCallbackDto {
  @IsString()
  bill_no: string;

  @IsNumber()
  transaction_id: number;

  @IsString()
  transaction_date: string;

  @IsString()
  transaction_time: string;

  @IsString()
  payer_account_no: string;

  @IsString()
  payer_name: string;

  @IsString()
  currency_code: string;

  @IsString()
  payment_method: string;

  @IsNumber()
  amount: number;

  @IsString()
  sender_bank_name: string;

  @IsString()
  sender_account_name: string;

  @IsString()
  settlement_date: string;

  @IsString()
  @IsOptional()
  settlement_time?: string;

  @IsString()
  settlement_status: string;

  @IsString()
  @IsOptional()
  settlement_error_message?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsOptional()
  bank_transaction_id?: string;
}
