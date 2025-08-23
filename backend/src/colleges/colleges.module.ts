import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CollegeProfileService } from './college-profile.service';
import { CollegeProfileController } from './college-profile.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CollegeProfileController],
  providers: [CollegeProfileService],
  exports: [CollegeProfileService],
})
export class CollegesModule {}
