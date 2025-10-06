import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  async getTransactions(@Req() req, @Query('limit') limit?: number) {
    return this.transactionService.getUserTransactions(req.user.id, limit || 50);
  }

  @Get('stats')
  async getStats(@Req() req) {
    return this.transactionService.getTransactionStats(req.user.id);
  }

  @Get(':id')
  async getTransaction(@Req() req, @Param('id') id: string) {
    return this.transactionService.getTransactionById(id, req.user.id);
  }
}