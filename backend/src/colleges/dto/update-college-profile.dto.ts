import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { collegeprofile_institutionType as InstitutionType } from '@prisma/client';

export class UpdateCollegeProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  institutionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPersonName?: string;

  @IsOptional()
  @IsEnum(InstitutionType)
  institutionType?: InstitutionType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  accreditation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
