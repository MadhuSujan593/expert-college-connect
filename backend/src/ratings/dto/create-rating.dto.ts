import { IsString, IsInt, IsOptional, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingQuestionDto {
  @IsString()
  question: string;

  @IsInt()
  @Min(1)
  @Max(5)
  answer: number;

  @IsString()
  category: string;
}

export class CreateRatingDto {
  @IsString()
  expertProfileId: string;

  @IsString()
  @IsOptional()
  collegeProfileId?: string;

  @IsString()
  @IsOptional()
  requirementId?: string;

  @IsString()
  @IsOptional()
  applicationId?: string;

  @IsString()
  @IsOptional()
  ratingRequestId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @IsString()
  @IsOptional()
  review?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRatingQuestionDto)
  questions: CreateRatingQuestionDto[];
}
