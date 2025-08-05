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
import { ExpertProfile } from '../../experts/entities/expert-profile.entity';

export enum ServiceType {
  WEBINAR = 'webinar',
  WORKSHOP = 'workshop',
  GUEST_LECTURE = 'guest_lecture',
  TEACHING = 'teaching',
  CONSULTATION = 'consultation',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('services')
@Index(['expertProfileId', 'status'])
@Index(['type', 'domain'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  expertProfileId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @Column()
  domain: string;

  @Column({ nullable: true })
  subDomain: string;

  @Column({ type: 'json', nullable: true })
  topics: string[];

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ nullable: true })
  duration: string; // e.g., "2 hours", "1 week"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  availability: any; // { days: [], timeSlots: [] }

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.ACTIVE,
  })
  status: ServiceStatus;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  inquiries: number;

  @Column({ type: 'json', nullable: true })
  tags: string[]; // AICTE-compliant, Academic, Industry, etc.

  @Column({ type: 'json', nullable: true })
  testimonials: any[]; // [{ college: string, rating: number, review: string }]

  @Column({ type: 'json', nullable: true })
  attachments: string[]; // URLs to sample materials, certificates, etc.

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ExpertProfile, (expert) => expert.services)
  @JoinColumn({ name: 'expertProfileId' })
  expert: ExpertProfile;
} 