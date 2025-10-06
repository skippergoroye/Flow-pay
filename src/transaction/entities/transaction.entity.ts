import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  reference: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ nullable: true })
  recipientName?: string;

  @Column({ nullable: true })
  paystackReference?: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  balanceBefore?: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  balanceAfter?: number;

  @CreateDateColumn()
  createdAt: Date;
}