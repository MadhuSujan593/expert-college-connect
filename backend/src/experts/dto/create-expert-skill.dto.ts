import { IsString, IsEnum, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { expertskill_skillLevel as SkillLevel } from '@prisma/client';

export class CreateExpertSkillDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  skillName: string;

  @IsEnum(SkillLevel)
  @IsOptional()
  skillLevel?: SkillLevel;
}
