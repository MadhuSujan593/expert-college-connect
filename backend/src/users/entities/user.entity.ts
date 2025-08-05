import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rating } from '../../ratings/entities/rating.entity';
import { ExpertProfile } from '../../experts/entities/expert-profile.entity';
import { CollegeProfile } from '../../colleges/entities/college-profile.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum UserRole {
  EXPERT = 'expert',
  COLLEGE = 'college',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  BLOCKED = 'blocked',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EXPERT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true })
  profileImage: string;

  // Trust and Rating
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalRatings: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ type: 'timestamp', nullable: true })
  premiumExpiresAt: Date;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Rating, (rating) => rating.fromUser)
  givenRatings: Rating[];

  @OneToMany(() => Rating, (rating) => rating.toUser)
  receivedRatings: Rating[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  // One-to-One relations for role-specific profiles
  expertProfile?: ExpertProfile;
  collegeProfile?: CollegeProfile;
} 