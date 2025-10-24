import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class SubmitContactFormDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsIn(['general', 'support', 'billing', 'partnership', 'feedback', 'bug'])
  type?: string = 'general';
}
