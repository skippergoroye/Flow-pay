import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { TransferDto } from './dto/wallet.dto';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('transfer')
  async transfer(@Req() req, @Body() dto: TransferDto) {
    return this.walletService.transfer(req.user.id, dto.recipientEmail, dto.amount);
  }
}