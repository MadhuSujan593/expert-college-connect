import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  requirementId: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsNumber()
  @IsOptional()
  proposedBudget?: number;

  @IsString()
  @IsOptional()
  proposedTimeline?: string;

  @IsString()
  @IsOptional()
  relevantExperience?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
