import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ratingrequest_status } from '@prisma/client';

export class CreateRatingRequestDto {
  @IsString()
  requirementId: string;

  @IsString()
  @IsOptional()
  applicationId?: string;

  @IsString()
  @IsOptional()
  message?: string;
}








