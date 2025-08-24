import { IsOptional, IsString, IsEnum, IsUrl } from 'class-validator';
import { collegeprofile_institutionType } from '@prisma/client';

export class UpdateCollegeProfileDto {
  @IsOptional()
  @IsString()
  institutionName?: string;

  @IsOptional()
  @IsString()
  contactPersonName?: string;

  @IsOptional()
  @IsEnum(collegeprofile_institutionType)
  institutionType?: collegeprofile_institutionType;

  @IsOptional()
  @IsString()
  accreditation?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
