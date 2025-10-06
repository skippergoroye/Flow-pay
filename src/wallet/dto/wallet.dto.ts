import { IsNumber, IsEmail, Min, IsString } from 'class-validator';

export class TransferDto {
  @IsEmail()
  recipientEmail: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class FundWalletDto {
  @IsNumber()
  @Min(100)
  amount: number;
}