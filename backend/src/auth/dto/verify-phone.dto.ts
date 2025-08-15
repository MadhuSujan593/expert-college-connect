import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPhoneDto {
  @ApiProperty({
    description: 'Phone number to verify (with or without country code)',
    example: '+917702113874 or 7702113874',
  })
  @Matches(/^(\+?[1-9]\d{1,14}|\d{10,15})$/, { 
    message: 'Please provide a valid phone number (10-15 digits, optionally starting with +)' 
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({
    description: 'OTP received via SMS',
    example: '123456',
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
} 