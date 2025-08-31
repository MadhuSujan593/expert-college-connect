import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';

export class SearchExpertsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  maxHourlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  minExperience?: number;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}
