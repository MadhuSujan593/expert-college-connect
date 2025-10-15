import { Module } from '@nestjs/common';
import { RatingRequestsService } from './rating-requests.service';
import { RatingRequestsController } from './rating-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RatingRequestsController],
  providers: [RatingRequestsService],
  exports: [RatingRequestsService],
})
export class RatingRequestsModule {}











