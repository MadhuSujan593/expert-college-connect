import { IsOptional, IsString, IsNumber, IsArray, IsEnum, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateExpertProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  primaryExpertise?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  availableFor?: string[] | string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  preferredMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumeUrl?: string;
}
