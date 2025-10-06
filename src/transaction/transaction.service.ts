import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return this.transactionRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction | null> {
    return this.transactionRepo.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async getTransactionStats(userId: string) {
    const transactions = await this.transactionRepo.find({
      where: { user: { id: userId } },
    });

    const totalCredit = transactions
      .filter(t => t.type === 'credit' && t.status === 'success')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebit = transactions
      .filter(t => t.type === 'debit' && t.status === 'success')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalCredit,
      totalDebit,
      transactionCount: transactions.length,
    };
  }
}