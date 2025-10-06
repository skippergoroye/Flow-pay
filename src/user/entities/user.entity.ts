import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Wallet } from '../../wallet/entities/wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
wallets: Wallet[];

}

