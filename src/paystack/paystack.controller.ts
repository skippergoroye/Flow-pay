import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaystackService } from './paystack.service';
import { InitializePaymentDto, VerifyPaymentDto, ResolveAccountDto, WithdrawDto } from './dto/paystack.dto';

@Controller('paystack')
@UseGuards(AuthGuard('jwt'))
export class PaystackController {
  constructor(private paystackService: PaystackService) {}

  @Post('initialize')
  async initializePayment(@Req() req, @Body() dto: InitializePaymentDto) {
    return this.paystackService.initializePayment(
      req.user.email,
      dto.amount,
      req.user.id,
    );
  }

  @Get('verify')
  async verifyPayment(@Query() query: VerifyPaymentDto) {
    return this.paystackService.verifyPayment(query.reference);
  }

  @Get('banks')
  async getBanks() {
    return this.paystackService.getBanks();
  }

  @Post('resolve-account')
  async resolveAccount(@Body() dto: ResolveAccountDto) {
    return this.paystackService.resolveAccountNumber(
      dto.accountNumber,
      dto.bankCode,
    );
  }

  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawDto) {

       const recipient = await this.paystackService.createTransferRecipient(
      dto.accountNumber,
      dto.bankCode,
      dto.accountName,
    );

    return this.paystackService.initiateTransfer(
      recipient.recipient_code,
      dto.amount,
      'Withdrawal from FlowPay',
    );
      
   
  }
}