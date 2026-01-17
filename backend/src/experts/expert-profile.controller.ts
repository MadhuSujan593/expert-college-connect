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
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FileUploadService } from '../common/services/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

@Controller('expert-profiles')
@UseGuards(JwtAuthGuard)
export class ExpertProfileController {
  constructor(
    private readonly expertProfileService: ExpertProfileService,
    private readonly fileUploadService: FileUploadService,
    private readonly prisma: PrismaService,
  ) { }

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
    console.log('=== UPDATE PROFILE ENDPOINT ===');
    console.log('User ID:', userId);
    console.log('Update data received:', JSON.stringify(updateData, null, 2));

    try {
      const result = await this.expertProfileService.updateProfile(userId, updateData);
      console.log('Profile updated successfully');
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        const path = require('path');
        const fs = require('fs');
        const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pics');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadProfilePicture(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('=== UPLOAD PROFILE PICTURE ENDPOINT HIT ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('File received:', file ? 'YES' : 'NO');
    console.log('File details:', file ? {
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
      filename: file.filename,
      path: file.path
    } : 'no file');

    if (!file) {
      throw new BadRequestException('No file uploaded or invalid file type');
    }

    const userId = (req.user as any).id;
    console.log('Processing file for user:', userId);

    // Get current profile to check for existing profile picture
    const currentProfile = await this.expertProfileService.getProfileByUserId(userId);

    // Delete old profile picture if exists
    if (currentProfile.profilePicture) {
      try {
        const oldFilename = currentProfile.profilePicture.split('/').pop();
        const path = require('path');
        const fs = require('fs');
        const oldFilePath = path.join(process.cwd(), 'uploads', 'profile-pics', oldFilename);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('Old profile picture deleted:', oldFilename);
        }
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
        // Continue with upload even if old file deletion fails
      }
    }

    // Create URL for the uploaded file using static file serving
    const baseUrl = process.env.BASE_URL;
    const fileUrl = `${baseUrl}/uploads/profile-pics/${file.filename}`;

    console.log('File URL:', fileUrl);

    // Update expert profile with profile picture URL
    console.log('Updating profile with URL:', fileUrl);
    const updatedProfile = await this.expertProfileService.updateProfile(userId, {
      profilePicture: fileUrl,
    });

    console.log('Profile updated, profilePicture field:', updatedProfile.profilePicture);

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: fileUrl,
      filename: file.filename,
    };
  }

  @Post('upload/resume')
  @UseInterceptors(FileInterceptor('resume', {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        const path = require('path');
        const fs = require('fs');
        const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async uploadResume(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid file type');
    }

    const userId = (req.user as any).id;

    // Get current profile to check for existing resume
    const currentProfile = await this.expertProfileService.getProfileByUserId(userId);

    // Delete old resume if exists
    if (currentProfile.resumeUrl) {
      try {
        const oldFilename = currentProfile.resumeUrl.split('/').pop();
        const path = require('path');
        const fs = require('fs');
        const oldFilePath = path.join(process.cwd(), 'uploads', 'resumes', oldFilename);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('Old resume deleted:', oldFilename);
        }
      } catch (error) {
        console.error('Error deleting old resume:', error);
        // Continue with upload even if old file deletion fails
      }
    }

    // Create URL for the uploaded file
    const baseUrl = process.env.BASE_URL;
    const fileUrl = `${baseUrl}/uploads/resumes/${file.filename}`;

    // Update expert profile with resume URL
    await this.expertProfileService.updateProfile(userId, {
      resumeUrl: fileUrl,
    });

    return {
      message: 'Resume uploaded successfully',
      resumeUrl: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
    };
  }

  @Delete('upload/profile-picture')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProfilePicture(@Req() req: Request) {
    const userId = (req.user as any).id;

    // First, get the current profile to find the file to delete
    const currentProfile = await this.expertProfileService.getProfileByUserId(userId);

    if (currentProfile.profilePicture) {
      try {
        // Extract filename from URL
        const filename = currentProfile.profilePicture.split('/').pop();

        // Delete the physical file
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(process.cwd(), 'uploads', 'profile-pics', filename);

        console.log('Attempting to delete file:', filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted successfully:', filename);
        } else {
          console.log('File not found, skipping deletion:', filename);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with database update even if file deletion fails
      }
    }

    // Update database to remove the URL
    await this.expertProfileService.updateProfile(userId, {
      profilePicture: null,
    });
  }

  @Delete('upload/resume')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeResume(@Req() req: Request) {
    const userId = (req.user as any).id;

    // First, get the current profile to find the file to delete
    const currentProfile = await this.expertProfileService.getProfileByUserId(userId);

    if (currentProfile.resumeUrl) {
      try {
        // Extract filename from URL
        const filename = currentProfile.resumeUrl.split('/').pop();

        // Delete the physical file
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(process.cwd(), 'uploads', 'resumes', filename);

        console.log('Attempting to delete resume file:', filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Resume file deleted successfully:', filename);
        } else {
          console.log('Resume file not found, skipping deletion:', filename);
        }
      } catch (error) {
        console.error('Error deleting resume file:', error);
        // Continue with database update even if file deletion fails
      }
    }

    // Update database to remove the URL
    await this.expertProfileService.updateProfile(userId, {
      resumeUrl: null,
    });
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
  // ============ SERVICE ENDPOINTS ============

  @Get('services')
  async getServices(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.expertProfileService.getServices(userId);
  }

  @Post('services')
  async createService(@Req() req: Request, @Body() serviceData: CreateServiceDto) {
    const userId = (req.user as any).id;
    console.log('Creating service for user:', userId);
    console.log('Service data:', serviceData);
    return this.expertProfileService.createService(userId, serviceData);
  }

  @Put('services/:serviceId')
  async updateService(
    @Req() req: Request,
    @Param('serviceId') serviceId: string,
    @Body() serviceData: UpdateServiceDto
  ) {
    const userId = (req.user as any).id;
    console.log('Updating service:', serviceId, 'for user:', userId);
    console.log('Service data:', serviceData);
    return this.expertProfileService.updateService(userId, serviceId, serviceData);
  }

  @Delete('services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteService(@Req() req: Request, @Param('serviceId') serviceId: string) {
    const userId = (req.user as any).id;
    console.log('Deleting service:', serviceId, 'for user:', userId);
    await this.expertProfileService.deleteService(userId, serviceId);
  }

  @Put('services/:serviceId/toggle-status')
  async toggleServiceStatus(@Req() req: Request, @Param('serviceId') serviceId: string) {
    const userId = (req.user as any).id;
    console.log('Toggling service status:', serviceId, 'for user:', userId);
    return this.expertProfileService.toggleServiceStatus(userId, serviceId);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard) // Add JWT auth guard for authenticated search
  async searchExperts(@Query() filters: SearchExpertsDto) {
    try {
      console.log('Search experts called with filters:', filters);
      const result = await this.expertProfileService.searchExperts(filters);
      console.log('Search result:', { count: result.experts?.length || 0, total: result.total });
      return result;
    } catch (error) {
      console.error('Error in searchExperts controller:', error);
      throw error;
    }
  }

  // Test endpoint to debug expert data
  @Get('debug/experts')
  @UseGuards(JwtAuthGuard)
  async debugExperts() {
    try {
      // Get all users with EXPERT role
      const expertUsers = await this.prisma.user.findMany({
        where: {
          role: 'EXPERT',
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          expertprofile: {
            select: {
              id: true,
              jobTitle: true,
              company: true,
              isVerified: true,
            }
          }
        }
      });

      // Get all expert profiles
      const allExpertProfiles = await this.prisma.expertprofile.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              role: true,
            }
          },
          expertskill: {
            select: {
              skillName: true,
            }
          }
        }
      });

      // Test search for "Training & Development"
      const testSearch = await this.prisma.expertprofile.findMany({
        where: {
          OR: [
            { jobTitle: { contains: 'Training' } },
            { company: { contains: 'Training' } },
            { expertskill: { some: { skillName: { contains: 'Training' } } } },
            // Test availableFor JSON search
            { availableFor: { path: '$[*]', string_contains: 'Training' } },
            { availableFor: { path: '$[*]', string_contains: 'Development' } },
          ],
        },
        include: {
          user: {
            select: {
              fullName: true,
            }
          },
          expertskill: {
            select: {
              skillName: true,
            }
          }
        }
      });

      // Simple test: get all expert profiles with basic info
      const simpleProfiles = await this.prisma.expertprofile.findMany({
        take: 5,
        include: {
          user: {
            select: {
              fullName: true,
              role: true,
            }
          }
        }
      });

      return {
        expertUsers,
        allExpertProfiles,
        expertUsersCount: expertUsers.length,
        expertProfilesCount: allExpertProfiles.length,
        testSearch,
        testSearchCount: testSearch.length,
        simpleProfiles,
        simpleProfilesCount: simpleProfiles.length
      };
    } catch (error) {
      console.error('Error in debugExperts:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards() // Remove auth guard for public profile view
  async getPublicProfile(@Param('id') profileId: string) {
    // This would get profile by profile ID, not user ID
    // For now, we'll use the user ID approach
    return this.expertProfileService.getProfileByUserId(profileId);
  }
}
