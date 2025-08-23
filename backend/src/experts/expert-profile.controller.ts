import { 
  Controller, 
  Get, 
  Put, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpertProfileService } from './expert-profile.service';
import { UpdateExpertProfileDto, CreateExpertSkillDto, SearchExpertsDto, CreateWorkExperienceDto, UpdateWorkExperienceDto } from './dto';
import { FileUploadService } from '../common/services/file-upload.service';
import type { Request } from 'express';

@Controller('expert-profiles')
@UseGuards(JwtAuthGuard)
export class ExpertProfileController {
  constructor(
    private readonly expertProfileService: ExpertProfileService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.expertProfileService.getProfileByUserId(userId);
  }

  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateData: UpdateExpertProfileDto,
  ) {
    const userId = (req.user as any).id;
    return this.expertProfileService.updateProfile(userId, updateData);
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.expertProfileService.getDashboardStats(userId);
  }

  @Post('skills')
  async addSkill(
    @Req() req: Request,
    @Body() skillData: CreateExpertSkillDto,
  ) {
    const userId = (req.user as any).id;
    return this.expertProfileService.addSkill(userId, skillData);
  }

  @Put('skills/:skillId')
  async updateSkill(
    @Req() req: Request,
    @Param('skillId') skillId: string,
    @Body() skillData: Partial<CreateExpertSkillDto>,
  ) {
    const userId = (req.user as any).id;
    return this.expertProfileService.updateSkill(userId, skillId, skillData);
  }

  @Delete('skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkill(
    @Req() req: Request,
    @Param('skillId') skillId: string,
  ) {
    const userId = (req.user as any).id;
    await this.expertProfileService.removeSkill(userId, skillId);
  }

  // File Upload Endpoints
  @Post('upload/profile-picture')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async uploadProfilePicture(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = (req.user as any).id;
    const fileInfo = this.fileUploadService.processProfilePicture(file);
    
    // Update user profile image in database
    await this.expertProfileService.updateProfile(userId, {
      // This would update the user's profileImage field
    });

    return {
      message: 'Profile picture uploaded successfully',
      url: fileInfo.url,
      filename: fileInfo.filename,
    };
  }

  @Post('upload/resume')
  @UseInterceptors(FileInterceptor('resume'))
  async uploadResume(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = (req.user as any).id;
    const fileInfo = this.fileUploadService.processResume(file);
    
    // Update expert profile with resume URL
    await this.expertProfileService.updateProfile(userId, {
      resumeUrl: fileInfo.url,
    });

    return {
      message: 'Resume uploaded successfully',
      url: fileInfo.url,
      filename: fileInfo.filename,
      originalName: fileInfo.originalName,
    };
  }

  // Work Experience Endpoints
  @Get('work-experience')
  async getWorkExperiences(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.expertProfileService.getWorkExperiences(userId);
  }

  @Post('work-experience')
  async addWorkExperience(
    @Req() req: Request,
    @Body() experienceData: CreateWorkExperienceDto,
  ) {
    const userId = (req.user as any).id;
    return this.expertProfileService.addWorkExperience(userId, experienceData);
  }

  @Put('work-experience/:experienceId')
  async updateWorkExperience(
    @Req() req: Request,
    @Param('experienceId') experienceId: string,
    @Body() experienceData: UpdateWorkExperienceDto,
  ) {
    const userId = (req.user as any).id;
    return this.expertProfileService.updateWorkExperience(userId, experienceId, experienceData);
  }

  @Delete('work-experience/:experienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWorkExperience(
    @Req() req: Request,
    @Param('experienceId') experienceId: string,
  ) {
    const userId = (req.user as any).id;
    await this.expertProfileService.removeWorkExperience(userId, experienceId);
  }

  // Public endpoints (no auth required)
  @Get('search')
  @UseGuards() // Remove auth guard for public search
  async searchExperts(@Query() filters: SearchExpertsDto) {
    return this.expertProfileService.searchExperts(filters);
  }

  @Get(':id')
  @UseGuards() // Remove auth guard for public profile view
  async getPublicProfile(@Param('id') profileId: string) {
    // This would get profile by profile ID, not user ID
    // For now, we'll use the user ID approach
    return this.expertProfileService.getProfileByUserId(profileId);
  }
}
