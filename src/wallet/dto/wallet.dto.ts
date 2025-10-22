// src/wallet/dto/wallet.dto.ts - ADD NEW DTO
import { IsNumber, IsEmail, Min, IsString, Length } from 'class-validator';

export class TransferDto {
  @IsEmail()
  recipientEmail: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class TransferByAccountDto {
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class FundWalletDto {
  @IsNumber()
  @Min(100)
  amount: number;
}
