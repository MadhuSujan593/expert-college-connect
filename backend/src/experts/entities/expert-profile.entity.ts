import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';

export enum ExpertType {
  INDUSTRY = 'industry',
  ACADEMIC = 'academic',
}

@Entity('expert_profiles')
export class ExpertProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  experience: number; // years

  @Column({ nullable: true })
  domain: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true })
  resume: string;

  @Column({
    type: 'enum',
    enum: ExpertType,
    nullable: true,
  })
  expertType: ExpertType;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'json', nullable: true })
  availability: any; // { days: [], timeSlots: [] }

  @Column({ type: 'json', nullable: true })
  serviceTypes: any; // { webinar: boolean, workshop: boolean, teaching: boolean }

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  certifications: string[];

  @Column({ type: 'json', nullable: true })
  achievements: string[];

  @Column({ type: 'json', nullable: true })
  socialLinks: any; // { linkedin, twitter, github, etc. }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.expertProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Service, (service) => service.expert)
  services: Service[];
} 