import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum NotificationType {
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_UPDATED = 'APPLICATION_STATUS_UPDATED',
  APPLICATION_SHORTLISTED = 'APPLICATION_SHORTLISTED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  REQUIREMENT_POSTED = 'REQUIREMENT_POSTED',
  REQUIREMENT_UPDATED = 'REQUIREMENT_UPDATED'
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  applicationId?: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean = false;
}
