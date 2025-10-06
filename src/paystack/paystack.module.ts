import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  providers: [PaystackService],
  controllers: [PaystackController],
  exports: [PaystackService],
})
export class PaystackModule {}
