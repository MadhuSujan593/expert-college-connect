import { IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from './create-notification.dto';

export class GetNotificationsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRead?: boolean;
}
