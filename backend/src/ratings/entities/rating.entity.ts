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

export enum RatingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('ratings')
@Index(['fromUserId', 'toUserId'], { unique: true })
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromUserId: string;

  @Column()
  toUserId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  rating: number; // 1.0 to 5.0

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({
    type: 'enum',
    enum: RatingStatus,
    default: RatingStatus.PENDING,
  })
  status: RatingStatus;

  @Column({ nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.givenRatings)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.receivedRatings)
  @JoinColumn({ name: 'toUserId' })
  toUser: User;
} 