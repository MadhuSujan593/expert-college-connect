import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { user_role as UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @Roles(UserRole.COLLEGE_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createRatingDto: CreateRatingDto) {
    // Get college profile ID from user
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId: req.user.id },
    });

    if (!collegeProfile) {
      throw new Error('College profile not found');
    }

    const rating = await this.ratingsService.create(createRatingDto, collegeProfile.id);
    
    return {
      success: true,
      message: 'Rating submitted successfully',
      data: rating,
    };
  }

  @Get()
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  async findAll(
    @Request() req,
    @Query('expertProfileId') expertProfileId?: string,
    @Query('collegeProfileId') collegeProfileId?: string
  ) {
    // For experts, only show their own ratings
    if (req.user.role === UserRole.EXPERT) {
      const expertProfile = await this.prisma.expertprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (!expertProfile) {
        throw new Error('Expert profile not found');
      }

      expertProfileId = expertProfile.id;
    }

    // For college admins, only show ratings from their college
    if (req.user.role === UserRole.COLLEGE_ADMIN) {
      const collegeProfile = await this.prisma.collegeprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (!collegeProfile) {
        throw new Error('College profile not found');
      }

      collegeProfileId = collegeProfile.id;
    }

    const ratings = await this.ratingsService.findAll(expertProfileId, collegeProfileId);
    
    return {
      success: true,
      data: ratings,
    };
  }

  @Get('questions')
  async getRatingQuestions() {
    const questions = await this.ratingsService.getRatingQuestions();
    
    return {
      success: true,
      data: questions,
    };
  }

  @Get('stats/:expertProfileId')
  async getRatingStats(@Param('expertProfileId') expertProfileId: string) {
    const stats = await this.ratingsService.getRatingStats(expertProfileId);
    
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    const rating = await this.ratingsService.findOne(id);
    
    // Check if user has permission to view this rating
    if (req.user.role === UserRole.EXPERT) {
      const expertProfile = await this.prisma.expertprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (rating.expertProfileId !== expertProfile?.id) {
        throw new Error('You can only view ratings for your own profile');
      }
    }

    if (req.user.role === UserRole.COLLEGE_ADMIN) {
      const collegeProfile = await this.prisma.collegeprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (rating.collegeProfileId !== collegeProfile?.id) {
        throw new Error('You can only view ratings from your college');
      }
    }
    
    return {
      success: true,
      data: rating,
    };
  }

  @Patch(':id')
  @Roles(UserRole.COLLEGE_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req
  ) {
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId: req.user.id },
    });

    if (!collegeProfile) {
      throw new Error('College profile not found');
    }

    const rating = await this.ratingsService.update(id, updateRatingDto, collegeProfile.id);
    
    return {
      success: true,
      message: 'Rating updated successfully',
      data: rating,
    };
  }

  @Delete(':id')
  @Roles(UserRole.COLLEGE_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId: req.user.id },
    });

    if (!collegeProfile) {
      throw new Error('College profile not found');
    }

    await this.ratingsService.remove(id, collegeProfile.id);
    
    return {
      success: true,
      message: 'Rating deleted successfully',
    };
  }
}
