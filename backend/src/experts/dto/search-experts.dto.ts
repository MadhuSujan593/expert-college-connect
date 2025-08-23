import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchExpertsDto {
  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxHourlyRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableFor?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
