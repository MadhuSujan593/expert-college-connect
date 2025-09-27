import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsBoolean()
  @IsOptional()
  autoRenews?: boolean;
}


