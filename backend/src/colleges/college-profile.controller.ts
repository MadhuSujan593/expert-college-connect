import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollegeProfileService } from './college-profile.service';
import { UpdateCollegeProfileDto, SearchCollegesDto } from './dto';
import type { Request } from 'express';

@Controller('college-profiles')
@UseGuards(JwtAuthGuard)
export class CollegeProfileController {
  constructor(private readonly collegeProfileService: CollegeProfileService) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.collegeProfileService.getProfileByUserId(userId);
  }

  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateData: UpdateCollegeProfileDto,
  ) {
    const userId = (req.user as any).id;
    return this.collegeProfileService.updateProfile(userId, updateData);
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.collegeProfileService.getDashboardStats(userId);
  }

  @Get('requirements/recent')
  async getRecentRequirements(@Req() req: Request, @Query('limit') limit?: string) {
    const userId = (req.user as any).id;
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.collegeProfileService.getRecentRequirements(userId, limitNum);
  }

  @Get('requirements/summary')
  async getRequirementsSummary(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.collegeProfileService.getRequirementsSummary(userId);
  }

  // Public endpoints (no auth required)
  @Get('search')
  @UseGuards() // Remove auth guard for public search
  async searchColleges(@Query() filters: SearchCollegesDto) {
    return this.collegeProfileService.searchColleges(filters);
  }

  @Get(':id')
  @UseGuards() // Remove auth guard for public profile view
  async getPublicProfile(@Param('id') profileId: string) {
    // This would get profile by profile ID, not user ID
    // For now, we'll use the user ID approach
    return this.collegeProfileService.getProfileByUserId(profileId);
  }
}
