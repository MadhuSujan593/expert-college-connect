import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsBoolean, 
  IsDateString, 
  MaxLength, 
  Min, 
  Max 
} from 'class-validator';
import { requirement_budgetType } from '@prisma/client';

export class CreateRequirementDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsString()
  @MaxLength(100)
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999.99)
  budget?: number;

  @IsOptional()
  @IsEnum(requirement_budgetType)
  budgetType?: requirement_budgetType;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  additionalNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  preferredExpertLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  preferredMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachments?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  skills?: string;
}
