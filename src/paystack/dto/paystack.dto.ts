import { IsString, IsNumber, Min, IsEmail } from 'class-validator';

export class InitializePaymentDto {
  @IsNumber()
  @Min(100)
  amount: number;
}

export class VerifyPaymentDto {
  @IsString()
  reference: string;
}

export class ResolveAccountDto {
  @IsString()
  accountNumber: string;

  @IsString()
  bankCode: string;
}

export class WithdrawDto {
  @IsString()
  accountNumber: string;

  @IsString()
  bankCode: string;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  accountName: string;
}