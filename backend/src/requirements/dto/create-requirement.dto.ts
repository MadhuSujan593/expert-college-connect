import { IsString, IsOptional, IsBoolean, IsNumber, ValidateIf } from 'class-validator';

export class CreateRequirementDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @ValidateIf((o) => o.deadline !== '' && o.deadline != null)
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  requiredSkills?: string;

  @IsOptional()
  @IsString()
  experience?: string;
}
