import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PaymentType {
  PREMIUM_SUBSCRIPTION = 'premium_subscription',
  FEATURED_LISTING = 'featured_listing',
  BOOSTED_VISIBILITY = 'boosted_visibility',
  ADVERTISEMENT = 'advertisement',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  WALLET = 'wallet',
}

@Entity('payments')
@Index(['userId', 'status'])
@Index(['stripePaymentIntentId'], { unique: true })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'json', nullable: true })
  paymentDetails: any; // Additional payment information

  @Column({ type: 'json', nullable: true })
  subscriptionDetails: any; // For subscription payments

  @Column({ nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;
} 