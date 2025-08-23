import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, MaxLength, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWorkExperienceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  jobTitle: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  achievements?: string;
}
