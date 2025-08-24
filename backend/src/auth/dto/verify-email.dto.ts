import { IsEmail, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'OTP received via email',
    example: '123456',
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;

  @ApiProperty({
    description: 'Whether this is for profile update (existing user changing email)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isProfileUpdate?: boolean;

  @ApiProperty({
    description: 'User ID for profile updates',
    example: 'user123',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
} 