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
  ValidateIf
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
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
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;

  // Expert-specific fields
  @ApiPropertyOptional({
    description: 'Current job title (required for experts)',
    example: 'Senior Data Scientist',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsString({ message: 'Job title must be a string' })
  @MinLength(2, { message: 'Job title must be at least 2 characters long' })
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Company/Organization (required for experts)',
    example: 'Google Inc.',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsString({ message: 'Company must be a string' })
  @MinLength(2, { message: 'Company must be at least 2 characters long' })
  company?: string;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: '5+ years',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Experience must be a string' })
  experience?: string;

  @ApiPropertyOptional({
    description: 'Primary area of expertise',
    example: 'Artificial Intelligence & Machine Learning',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Primary expertise must be a string' })
  primaryExpertise?: string;

  @ApiPropertyOptional({
    description: 'Skills (comma-separated)',
    example: 'Python, Machine Learning, Data Analysis',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Skills must be a string' })
  skills?: string;

  @ApiPropertyOptional({
    description: 'Professional bio',
    example: 'Experienced data scientist with expertise in ML and AI...',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Available for (comma-separated)',
    example: 'Guest Lectures, Workshops, Mentoring',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Available for must be a string' })
  availableFor?: string;

  @ApiPropertyOptional({
    description: 'Preferred mode of interaction',
    example: 'Online',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Preferred mode must be a string' })
  preferredMode?: string;

  @ApiPropertyOptional({
    description: 'Hourly rate in USD',
    example: '150.00',
  })
  @ValidateIf(o => o.role === UserRole.EXPERT)
  @IsOptional()
  @IsString({ message: 'Hourly rate must be a string' })
  hourlyRate?: string;

  // College-specific fields
  @ApiPropertyOptional({
    description: 'Institution name (required for colleges)',
    example: 'Harvard University',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsString({ message: 'Institution name must be a string' })
  @MinLength(2, { message: 'Institution name must be at least 2 characters long' })
  institutionName?: string;

  @ApiPropertyOptional({
    description: 'Contact person name (required for colleges)',
    example: 'Dr. Jane Smith',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsString({ message: 'Contact person name must be a string' })
  @MinLength(2, { message: 'Contact person name must be at least 2 characters long' })
  contactPersonName?: string;

  @ApiPropertyOptional({
    description: 'Institution type',
    example: 'UNIVERSITY',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Institution type must be a string' })
  institutionType?: string;

  @ApiPropertyOptional({
    description: 'Institution website',
    example: 'https://www.harvard.edu',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Institution address',
    example: '123 Main Street, Cambridge, MA 02138',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Cambridge',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @ApiPropertyOptional({
    description: 'State/Province',
    example: 'Massachusetts',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'United States',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '02138',
  })
  @ValidateIf(o => o.role === UserRole.COLLEGE_ADMIN)
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  postalCode?: string;

  // Terms and conditions
  @ApiProperty({
    description: 'Agreement to terms and conditions',
    example: true,
  })
  @IsBoolean({ message: 'Terms agreement must be a boolean' })
  agreeToTerms: boolean;

  @ApiPropertyOptional({
    description: 'Agreement to marketing communications',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Marketing agreement must be a boolean' })
  agreeToMarketing?: boolean;
} 