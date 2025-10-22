// src/wallet/wallet.controller.ts - ADD THIS NEW ENDPOINT
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { TransferDto, TransferByAccountDto } from './dto/wallet.dto';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('details')
  async getWalletDetails(@Req() req) {
    return this.walletService.getWalletDetails(req.user.id);
  }

  @Post('transfer')
  async transfer(@Req() req, @Body() dto: TransferDto) {
    return this.walletService.transfer(req.user.id, dto.recipientEmail, dto.amount);
  }

  @Post('transfer-by-account')
  async transferByAccount(@Req() req, @Body() dto: TransferByAccountDto) {
    return this.walletService.transferByAccountNumber(
      req.user.id,
      dto.accountNumber,
      dto.amount
    );
  }
}