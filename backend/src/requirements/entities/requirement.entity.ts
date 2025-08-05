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
import { CollegeProfile } from '../../colleges/entities/college-profile.entity';

export enum RequirementType {
  WEBINAR = 'webinar',
  WORKSHOP = 'workshop',
  GUEST_LECTURE = 'guest_lecture',
  TEACHING = 'teaching',
  CONSULTATION = 'consultation',
}

export enum RequirementStatus {
  ACTIVE = 'active',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('requirements')
@Index(['collegeProfileId', 'status'])
@Index(['domain', 'status'])
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collegeProfileId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: RequirementType,
  })
  type: RequirementType;

  @Column()
  domain: string;

  @Column({ nullable: true })
  subDomain: string;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  qualifications: string[];

  @Column({ nullable: true })
  experienceRequired: number; // years

  @Column({ nullable: true })
  duration: string; // e.g., "2 hours", "1 week"

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'json', nullable: true })
  schedule: any; // { days: [], timeSlots: [] }

  @Column({
    type: 'enum',
    enum: RequirementStatus,
    default: RequirementStatus.ACTIVE,
  })
  status: RequirementStatus;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  applications: number;

  @Column({ type: 'json', nullable: true })
  tags: string[]; // AICTE-compliant, Academic, Industry, etc.

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CollegeProfile, (college) => college.requirements)
  @JoinColumn({ name: 'collegeProfileId' })
  college: CollegeProfile;
} 