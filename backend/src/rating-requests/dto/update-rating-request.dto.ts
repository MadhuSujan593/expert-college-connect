import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingRequestDto } from './create-rating-request.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ratingrequest_status } from '@prisma/client';

export class UpdateRatingRequestDto extends PartialType(CreateRatingRequestDto) {
  @IsEnum(ratingrequest_status)
  @IsOptional()
  status?: ratingrequest_status;
}










