import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async createWithWallet(userData: Partial<User>): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(user);

      // Create wallet for the user
      const accountNumber = this.generateAccountNumber();
      const wallet = queryRunner.manager.create(Wallet, {
        user: savedUser,
        accountNumber,
        balance: 0,
        currency: 'NGN',
      });
      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();
      return savedUser;
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    await this.userRepo.update(userId, updates);
    return this.findById(userId);
  }
}
