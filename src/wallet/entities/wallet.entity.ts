import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ unique: true })
  accountNumber: string;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  // @ManyToOne(() => User, (user) => user.wallets, { eager: true })
  // user: User;

}