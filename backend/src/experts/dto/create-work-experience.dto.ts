import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, MaxLength, IsArray, ValidateIf } from 'class-validator';
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
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @ValidateIf((o) => !o.isCurrent && o.endDate !== undefined && o.endDate !== null)
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
