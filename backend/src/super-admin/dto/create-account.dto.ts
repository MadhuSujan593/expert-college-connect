import { 
  IsEmail, 
  IsOptional, 
  IsString, 
  MinLength, 
  IsEnum, 
  Matches,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  ValidateIf,
  IsNumber
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { user_role } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    description: 'User phone number (with or without country code)',
    example: '+917702113874 or 7702113874',
  })
  @IsOptional()
  @Matches(/^(\+?[1-9]\d{1,14}|\d{10,15})$/, { 
    message: 'Please provide a valid phone number (10-15 digits, optionally starting with +)' 
  })
  phone?: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  fullName: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    }
  )
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: user_role,
    example: user_role.EXPERT,
  })
  @IsEnum(user_role, { message: 'Invalid user role' })
  role: user_role;

  // Expert-specific fields
  @ApiPropertyOptional({
    description: 'Job title (required for experts)',
    example: 'Senior Software Engineer',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsString({ message: 'Job title must be a string' })
  @MinLength(2, { message: 'Job title must be at least 2 characters long' })
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Company name (required for experts)',
    example: 'Google Inc.',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  company?: string;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: '5',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Experience must be a string' })
  experience?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'San Francisco, CA',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://johndoe.com',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Primary expertise area',
    example: 'Machine Learning',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Primary expertise must be a string' })
  primaryExpertise?: string;

  @ApiPropertyOptional({
    description: 'Skills (comma-separated)',
    example: 'Python, Machine Learning, Data Science',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Skills must be a string' })
  skills?: string;

  @ApiPropertyOptional({
    description: 'Professional bio',
    example: 'Experienced software engineer with expertise in...',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Available for (comma-separated)',
    example: 'Guest Lectures, Workshops, Mentoring',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Available for must be a string' })
  availableFor?: string;

  @ApiPropertyOptional({
    description: 'Preferred mode of interaction',
    example: 'Online',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsString({ message: 'Preferred mode must be a string' })
  preferredMode?: string;

  @ApiPropertyOptional({
    description: 'Hourly rate in USD',
    example: '150.00',
  })
  @ValidateIf(o => o.role === user_role.EXPERT)
  @IsOptional()
  @IsNumber({}, { message: 'Hourly rate must be a number' })
  hourlyRate?: number;

  // College-specific fields
  @ApiPropertyOptional({
    description: 'Institution name (required for colleges)',
    example: 'Harvard University',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsString({ message: 'Institution name must be a string' })
  @MinLength(2, { message: 'Institution name must be at least 2 characters long' })
  institutionName?: string;

  @ApiPropertyOptional({
    description: 'Contact person name (required for colleges)',
    example: 'Dr. Jane Smith',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsString({ message: 'Contact person name must be a string' })
  @MinLength(2, { message: 'Contact person name must be at least 2 characters long' })
  contactPersonName?: string;

  @ApiPropertyOptional({
    description: 'Institution type',
    example: 'UNIVERSITY',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Institution type must be a string' })
  institutionType?: string;

  @ApiPropertyOptional({
    description: 'Institution website',
    example: 'https://harvard.edu',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Institution website must be a string' })
  institutionWebsite?: string;

  @ApiPropertyOptional({
    description: 'Institution address',
    example: 'Cambridge, MA 02138',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Institution address must be a string' })
  institutionAddress?: string;

  @ApiPropertyOptional({
    description: 'Institution description',
    example: 'A leading research university...',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Institution description must be a string' })
  institutionDescription?: string;

  @ApiPropertyOptional({
    description: 'Student count',
    example: '50000',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Student count must be a string' })
  studentCount?: string;

  @ApiPropertyOptional({
    description: 'Founded year',
    example: '1636',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Founded year must be a string' })
  foundedYear?: string;

  @ApiPropertyOptional({
    description: 'Accreditation information',
    example: 'Accredited by AACSB',
  })
  @ValidateIf(o => o.role === user_role.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Accreditation must be a string' })
  accreditation?: string;

  @ApiPropertyOptional({
    description: 'Whether to send welcome email',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Send welcome email must be a boolean' })
  sendWelcomeEmail?: boolean;
}
