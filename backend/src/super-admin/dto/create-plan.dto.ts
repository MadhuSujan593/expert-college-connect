import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export enum AudienceEnum {
  COLLEGE = 'COLLEGE',
  EXPERT = 'EXPERT',
}

export enum PlanTypeEnum {
  FREE = 'FREE',
  PAID = 'PAID',
}

export enum BillingPeriodEnum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  YEARLY = 'YEARLY',
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AudienceEnum)
  audience: AudienceEnum;

  @IsEnum(PlanTypeEnum)
  planType: PlanTypeEnum;

  @IsEnum(BillingPeriodEnum)
  billingPeriod: BillingPeriodEnum;

  @IsInt()
  @IsPositive()
  durationDays: number;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @IsOptional()
  maxRequirements?: number | null;

  @IsInt()
  @IsOptional()
  maxExpertContacts?: number | null;
}


