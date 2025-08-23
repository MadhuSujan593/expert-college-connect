import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { ExpertProfileService } from './expert-profile.service';
import { ExpertProfileController } from './expert-profile.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ExpertProfileController],
  providers: [ExpertProfileService],
  exports: [ExpertProfileService],
})
export class ExpertsModule {}
