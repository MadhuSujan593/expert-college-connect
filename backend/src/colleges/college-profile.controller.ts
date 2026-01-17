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
  BadRequestException,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollegeProfileService } from './college-profile.service';
import { UpdateCollegeProfileDto, SearchCollegesDto } from './dto';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('college-profiles')
@UseGuards(JwtAuthGuard)
export class CollegeProfileController {
  constructor(private readonly collegeProfileService: CollegeProfileService) { }

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

    // Debug: Log the incoming data
    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('User ID:', userId);
    console.log('Update data:', updateData);
    console.log('================================');

    try {
      // Clean the data - convert empty strings to undefined
      const profileData: UpdateCollegeProfileDto = { ...updateData };

      Object.keys(profileData).forEach(key => {
        if (profileData[key] === '') {
          profileData[key] = undefined;
        }
      });

      console.log('Final profile data to update:', profileData);

      return this.collegeProfileService.updateProfile(userId, profileData);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw new BadRequestException(`Failed to update profile: ${error.message}`);
    }
  }

  // Logo upload endpoint
  @Post('profile/logo-upload')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/profile-pics',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `college-logo-${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  async uploadLogoFile(
    @Req() req: Request,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const userId = (req.user as any).id;

    if (!logo) {
      throw new BadRequestException('No logo file uploaded');
    }

    // Create the full logo URL with base URL
    const baseUrl = process.env.BASE_URL;
    const logoUrl = `${baseUrl}/uploads/profile-pics/${logo.filename}`;

    console.log('Logo uploaded for user:', userId);
    console.log('Logo file:', logo);
    console.log('Logo URL:', logoUrl);

    // Update the college profile with the new logo URL
    return this.collegeProfileService.uploadLogo(userId, logoUrl);
  }

  @Post('profile/logo')
  async uploadLogoUrl(
    @Req() req: Request,
    @Body('logoUrl') logoUrl: string,
  ) {
    const userId = (req.user as any).id;

    if (!logoUrl) {
      throw new BadRequestException('No logo URL provided');
    }

    return this.collegeProfileService.uploadLogo(userId, logoUrl);
  }



  @Delete('profile/logo')
  async removeLogo(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.collegeProfileService.removeLogo(userId);
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
