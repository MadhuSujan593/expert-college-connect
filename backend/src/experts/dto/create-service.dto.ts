import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ServicePriceType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  NEGOTIABLE = 'NEGOTIABLE'
}

export enum ServiceCategory {
  WEBINAR = 'WEBINAR',
  WORKSHOP = 'WORKSHOP',
  TEACHING = 'TEACHING',
  CONSULTING = 'CONSULTING',
  MENTORING = 'MENTORING',
  PROJECT_GUIDANCE = 'PROJECT_GUIDANCE',
  CAREER_COUNSELING = 'CAREER_COUNSELING',
  TECHNICAL_REVIEW = 'TECHNICAL_REVIEW'
}

export class CreateServiceDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsEnum(ServicePriceType)
  priceType: ServicePriceType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  duration?: number; // in minutes

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;
}
