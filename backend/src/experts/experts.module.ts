import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { ExpertProfileService } from './expert-profile.service';
import { ExpertProfileController } from './expert-profile.controller';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ExpertProfileController, RecommendationsController],
  providers: [ExpertProfileService, RecommendationsService],
  exports: [ExpertProfileService, RecommendationsService],
})
export class ExpertsModule {}
