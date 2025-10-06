import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transaction/entities/transaction.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async createWallet(user: User): Promise<Wallet> {
    const accountNumber = this.generateAccountNumber();
    const wallet = this.walletRepo.create({
      user,
      accountNumber,
      balance: 0,
    });
    return this.walletRepo.save(wallet);
  }

  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
    };
  }

  async fundWallet(userId: string, amount: number, reference: string): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      wallet.balance = Number(wallet.balance) + amount;
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        user: wallet.user,
        reference,
        amount,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESS,
        description: 'Wallet funding',
        balanceBefore,
        balanceAfter: Number(wallet.balance),
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(
    senderId: string,
    recipientEmail: string,
    amount: number,
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: senderId } },
        relations: ['user'],
      });

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      if (Number(senderWallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const recipient = await queryRunner.manager.findOne(User, {
        where: { email: recipientEmail },
      });

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      const recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: recipient.id } },
      });

      if (!recipientWallet) {
        throw new NotFoundException('Recipient wallet not found');
      }

      // Debit sender
      const senderBalanceBefore = Number(senderWallet.balance);
      senderWallet.balance = Number(senderWallet.balance) - amount;
      await queryRunner.manager.save(senderWallet);

      // Credit recipient
      recipientWallet.balance = Number(recipientWallet.balance) + amount;
      await queryRunner.manager.save(recipientWallet);

      // Create transaction record
      const reference = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transaction = queryRunner.manager.create(Transaction, {
        user: senderWallet.user,
        reference,
        amount,
        type: TransactionType.DEBIT,
        status: TransactionStatus.SUCCESS,
        description: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
        recipientEmail,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        balanceBefore: senderBalanceBefore,
        balanceAfter: Number(senderWallet.balance),
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private generateAccountNumber(): string {
    return '30' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  }
}