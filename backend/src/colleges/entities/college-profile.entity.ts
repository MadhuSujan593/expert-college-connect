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
import { Requirement } from '../../requirements/entities/requirement.entity';

export enum InstitutionType {
  UNIVERSITY = 'university',
  COLLEGE = 'college',
  INSTITUTE = 'institute',
  SCHOOL = 'school',
}

export enum AccreditationType {
  AICTE = 'aicte',
  UGC = 'ugc',
  NAAC = 'naac',
  NBA = 'nba',
  NONE = 'none',
}

@Entity('college_profiles')
export class CollegeProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  institutionName: string;

  @Column({
    type: 'enum',
    enum: InstitutionType,
    default: InstitutionType.COLLEGE,
  })
  institutionType: InstitutionType;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: AccreditationType,
    default: AccreditationType.NONE,
  })
  accreditation: AccreditationType;

  @Column({ type: 'json', nullable: true })
  accreditations: string[]; // Multiple accreditations

  @Column({ type: 'json', nullable: true })
  departments: string[]; // List of departments

  @Column({ type: 'json', nullable: true })
  courses: string[]; // List of courses offered

  @Column({ type: 'json', nullable: true })
  facilities: string[]; // Available facilities

  @Column({ type: 'json', nullable: true })
  achievements: string[]; // Awards and achievements

  @Column({ type: 'json', nullable: true })
  partnerships: string[]; // Industry partnerships

  @Column({ type: 'json', nullable: true })
  socialLinks: any; // { website, linkedin, facebook, etc. }

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  studentCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  facultyCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.collegeProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Requirement, (requirement) => requirement.college)
  requirements: Requirement[];
} 