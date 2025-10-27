import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('opportunities')
  async getRecommendedOpportunities(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('minScore') minScore?: number,
    @Query('search') search?: string,
  ) {
    return this.recommendationsService.getRecommendedOpportunities(
      req.user.id,
      page,
      limit,
      minScore,
      search,
    );
  }

  @Get('stats')
  async getRecommendationStats(@Request() req) {
    return this.recommendationsService.getRecommendationStats(req.user.id);
  }

  @Get('college')
  async getCollegeRecommendations(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('minScore') minScore?: number,
  ) {
    // Get college profile ID from user
    const collegeProfile = await this.recommendationsService['prisma'].collegeprofile.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found');
    }

    return this.recommendationsService.getCollegeRecommendations(
      collegeProfile.id,
      page,
      limit,
      minScore,
    );
  }
}
