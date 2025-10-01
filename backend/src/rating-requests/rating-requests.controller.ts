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
import { RatingRequestsService } from './rating-requests.service';
import { CreateRatingRequestDto } from './dto/create-rating-request.dto';
import { UpdateRatingRequestDto } from './dto/update-rating-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { user_role as UserRole } from '@prisma/client';

@Controller('rating-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingRequestsController {
  constructor(private readonly ratingRequestsService: RatingRequestsService) {}

  @Post()
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createRatingRequestDto: CreateRatingRequestDto) {
    // Get expert profile ID from user
    const expertProfile = await this.ratingRequestsService['prisma'].expertprofile.findUnique({
      where: { userId: req.user.id },
    });

    if (!expertProfile) {
      throw new Error('Expert profile not found');
    }

    const ratingRequest = await this.ratingRequestsService.create(createRatingRequestDto, expertProfile.id);
    
    return {
      success: true,
      message: 'Rating request submitted successfully',
      data: ratingRequest,
    };
  }

  @Get()
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  async findAll(
    @Request() req,
    @Query('expertProfileId') expertProfileId?: string,
    @Query('collegeProfileId') collegeProfileId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    // For experts, only show their own rating requests
    if (req.user.role === UserRole.EXPERT) {
      const expertProfile = await this.ratingRequestsService['prisma'].expertprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (!expertProfile) {
        throw new Error('Expert profile not found');
      }

      expertProfileId = expertProfile.id;
    }

    // For college admins, only show rating requests for their college
    if (req.user.role === UserRole.COLLEGE_ADMIN) {
      const collegeProfile = await this.ratingRequestsService['prisma'].collegeprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (!collegeProfile) {
        throw new Error('College profile not found');
      }

      collegeProfileId = collegeProfile.id;
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    const result = await this.ratingRequestsService.findAll(expertProfileId, collegeProfileId, pageNum, limitNum);
    
    return {
      success: true,
      data: result.data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    };
  }

  @Get('stats')
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  async getStats(@Request() req) {
    let expertProfileId: string | undefined;
    let collegeProfileId: string | undefined;

    if (req.user.role === UserRole.EXPERT) {
      const expertProfile = await this.ratingRequestsService['prisma'].expertprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (!expertProfile) {
        throw new Error('Expert profile not found');
      }

      expertProfileId = expertProfile.id;
    }

    if (req.user.role === UserRole.COLLEGE_ADMIN) {
      const collegeProfile = await this.ratingRequestsService['prisma'].collegeprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (!collegeProfile) {
        throw new Error('College profile not found');
      }

      collegeProfileId = collegeProfile.id;
    }

    const stats = await this.ratingRequestsService.getStats(expertProfileId, collegeProfileId);
    
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    const ratingRequest = await this.ratingRequestsService.findOne(id);
    
    // Check if user has permission to view this rating request
    if (req.user.role === UserRole.EXPERT) {
      const expertProfile = await this.ratingRequestsService['prisma'].expertprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (ratingRequest.expertProfileId !== expertProfile?.id) {
        throw new Error('You can only view your own rating requests');
      }
    }

    if (req.user.role === UserRole.COLLEGE_ADMIN) {
      const collegeProfile = await this.ratingRequestsService['prisma'].collegeprofile.findUnique({
        where: { userId: req.user.id },
      });

      if (ratingRequest.collegeProfileId !== collegeProfile?.id) {
        throw new Error('You can only view rating requests for your college');
      }
    }
    
    return {
      success: true,
      data: ratingRequest,
    };
  }

  @Patch(':id')
  @Roles(UserRole.COLLEGE_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateRatingRequestDto: UpdateRatingRequestDto,
    @Request() req
  ) {
    const collegeProfile = await this.ratingRequestsService['prisma'].collegeprofile.findUnique({
      where: { userId: req.user.id },
    });

    if (!collegeProfile) {
      throw new Error('College profile not found');
    }

    const ratingRequest = await this.ratingRequestsService.update(id, updateRatingRequestDto, collegeProfile.id);
    
    return {
      success: true,
      message: 'Rating request updated successfully',
      data: ratingRequest,
    };
  }

  @Delete(':id')
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const expertProfile = await this.ratingRequestsService['prisma'].expertprofile.findUnique({
      where: { userId: req.user.id },
    });

    if (!expertProfile) {
      throw new Error('Expert profile not found');
    }

    await this.ratingRequestsService.remove(id, expertProfile.id);
    
    return {
      success: true,
      message: 'Rating request deleted successfully',
    };
  }
}
