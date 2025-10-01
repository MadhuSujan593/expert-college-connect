import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCollegeProfileDto } from './dto';

@Injectable()
export class CollegeProfileService {
  constructor(private readonly prisma: PrismaService) {}



  /**
   * Get college profile by user ID
   */
  async getProfileByUserId(userId: string) {
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profileImage: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            phone: true, // Include phone from user table
          },
        },
        requirement: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            requirement: true,
          },
        },
      },
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found');
    }

    // Merge phone from user table if college profile phone is null
    const mergedProfile = {
      ...collegeProfile,
      phone: collegeProfile.phone || collegeProfile.user.phone,
    };

    // Debug: Log the profile data being returned
    console.log('=== BACKEND PROFILE DATA ===');
    console.log('Full college profile:', collegeProfile);
    console.log('College profile phone:', collegeProfile.phone);
    console.log('User phone:', collegeProfile.user.phone);
    console.log('Merged phone:', mergedProfile.phone);
    console.log('Phone field type:', typeof mergedProfile.phone);
    
    const response = {
      ...mergedProfile,
      totalRequirements: (collegeProfile as any)._count.requirement,
      activeRequirements: collegeProfile.requirement.length,
      profileCompleteness: this.calculateProfileCompleteness(mergedProfile),
    };
    
    console.log('=== BACKEND RESPONSE ===');
    console.log('Response phone field:', response.phone);
    
    return response;
  }

  /**
   * Update college profile
   */
  async updateProfile(userId: string, updateData: UpdateCollegeProfileDto) {
    const existingProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('College profile not found');
    }

    // Validate required fields
    this.validateProfileData(updateData);

    // Prepare college profile update data (exclude user fields)
    const { userEmail, userPhone, updateUserEmail, updateUserPhone, ...collegeProfileData } = updateData;

    // Update college profile
    const updatedProfile = await this.prisma.collegeprofile.update({
      where: { userId },
      data: {
        ...collegeProfileData,
        updatedAt: new Date(),
        isProfileComplete: this.checkProfileCompleteness({
          ...existingProfile,
          ...collegeProfileData,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profileImage: true,
            phone: true, // Include phone field
            isPhoneVerified: true, // Include phone verification status
          },
        },
      },
    });

    // Update user information if requested
    if (updateUserEmail && userEmail) {
      // Check if email is already taken by another user
      const existingUser = await this.prisma.user.findFirst({
        where: { 
          email: userEmail, 
          isActive: true, 
          isDeleted: false,
          id: { not: userId } // Exclude current user
        }
      });

      if (existingUser) {
        throw new BadRequestException('This email is already in use by another account');
      }

      // Update user's email and set it as verified
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          email: userEmail,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    if (updateUserPhone && userPhone) {
      // Check if phone is already taken by another user
      const existingUser = await this.prisma.user.findFirst({
        where: { 
          phone: userPhone, 
          isActive: true, 
          isDeleted: false,
          id: { not: userId } // Exclude current user
        }
      });

      if (existingUser) {
        throw new BadRequestException('This phone number is already in use by another account');
      }

      // Update user's phone and set it as verified
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          phone: userPhone,
          isPhoneVerified: true,
          phoneVerifiedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Fetch updated user data if user information was updated
    let finalProfile = updatedProfile;
    if (updateUserEmail || updateUserPhone) {
      const refreshedProfile = await this.prisma.collegeprofile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              profileImage: true,
              phone: true, // Include phone field
              isPhoneVerified: true, // Include phone verification status
            },
          },
        },
      });
      
      if (refreshedProfile) {
        finalProfile = refreshedProfile;
      }
    }

    return {
      ...finalProfile,
      profileCompleteness: this.calculateProfileCompleteness(finalProfile),
    };
  }

  /**
   * Upload logo for college profile
   */
  async uploadLogo(userId: string, logoUrl: string) {
    const existingProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('College profile not found');
    }

    // Delete the old logo file if it exists
    if (existingProfile.logoUrl) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        // Extract filename from the old logo URL
        let filename = existingProfile.logoUrl;
        if (filename.includes('/uploads/profile-pics/')) {
          filename = filename.split('/uploads/profile-pics/')[1];
        } else if (filename.includes('uploads/profile-pics/')) {
          filename = filename.split('uploads/profile-pics/')[1];
        }
        
        if (filename) {
          const filePath = path.join(process.cwd(), 'uploads', 'profile-pics', filename);
          console.log('Attempting to delete old logo file:', filePath);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('✅ Old logo file deleted successfully:', filename);
          } else {
            console.log('⚠️ Old logo file not found at path:', filePath);
          }
        }
      } catch (error) {
        console.error('❌ Error deleting old logo file:', error);
        // Continue with upload even if old file deletion fails
      }
    }

    const updatedProfile = await this.prisma.collegeprofile.update({
      where: { userId },
      data: {
        logoUrl,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      ...updatedProfile,
      profileCompleteness: this.calculateProfileCompleteness(updatedProfile),
    };
  }

  /**
   * Remove logo from college profile
   */
  async removeLogo(userId: string) {
    const existingProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('College profile not found');
    }

    // Delete the physical logo file if it exists
    if (existingProfile.logoUrl) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        console.log('🔍 Logo removal debug info:');
        console.log('Original logoUrl:', existingProfile.logoUrl);
        console.log('Current working directory:', process.cwd());
        
        // Extract filename from the logo URL
        let filename = existingProfile.logoUrl;
        if (filename.includes('/uploads/profile-pics/')) {
          filename = filename.split('/uploads/profile-pics/')[1];
          console.log('Extracted filename (method 1):', filename);
        } else if (filename.includes('uploads/profile-pics/')) {
          filename = filename.split('uploads/profile-pics/')[1];
          console.log('Extracted filename (method 2):', filename);
        } else {
          console.log('Could not extract filename from URL:', filename);
        }
        
        if (filename) {
          const filePath = path.join(process.cwd(), 'uploads', 'profile-pics', filename);
          console.log('Full file path to delete:', filePath);
          console.log('File exists check:', fs.existsSync(filePath));
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('✅ Logo file deleted successfully:', filename);
          } else {
            console.log('⚠️ Logo file not found at path:', filePath);
            
            // Try alternative paths
            const altPath1 = path.join(process.cwd(), 'uploads', 'profile-pics', filename);
            const altPath2 = path.join(__dirname, '..', '..', 'uploads', 'profile-pics', filename);
            const altPath3 = path.join(__dirname, '..', '..', '..', 'uploads', 'profile-pics', filename);
            
            console.log('Alternative path 1:', altPath1, 'exists:', fs.existsSync(altPath1));
            console.log('Alternative path 2:', altPath2, 'exists:', fs.existsSync(altPath2));
            console.log('Alternative path 3:', altPath3, 'exists:', fs.existsSync(altPath3));
          }
        }
      } catch (error) {
        console.error('❌ Error deleting logo file:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        // Continue with database update even if file deletion fails
      }
    } else {
      console.log('No logoUrl found in profile, skipping file deletion');
    }

    const updatedProfile = await this.prisma.collegeprofile.update({
      where: { userId },
      data: {
        logoUrl: null,
        updatedAt: new Date(),
        isProfileComplete: this.checkProfileCompleteness({
          ...existingProfile,
          logoUrl: null,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      ...updatedProfile,
      profileCompleteness: this.calculateProfileCompleteness(updatedProfile),
    };
  }

  /**
   * Validate profile data
   */
  private validateProfileData(data: UpdateCollegeProfileDto) {
    // Validate phone number if provided
    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new BadRequestException('Invalid phone number');
    }
  }

  /**
   * Check if phone number is valid
   */
  private isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Get college dashboard stats
   */
  async getDashboardStats(userId: string) {
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found');
    }

    const [
      totalRequirements,
      activeRequirements,
      urgentRequirements,
      profileViews,
    ] = await Promise.all([
      this.prisma.requirement.count({
        where: { collegeProfileId: collegeProfile.id },
      }),
      this.prisma.requirement.count({
        where: { collegeProfileId: collegeProfile.id, isActive: true },
      }),
      this.prisma.requirement.count({
        where: { 
          collegeProfileId: collegeProfile.id, 
          isActive: true,
          isUrgent: true,
        },
      }),
      // Profile views would need to be tracked separately
      0, // Placeholder for now
    ]);

    const upcomingDeadlines = await this.prisma.requirement.count({
      where: {
        collegeProfileId: collegeProfile.id,
        isActive: true,
        deadline: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    });

    return {
      totalRequirements,
      activeRequirements,
      urgentRequirements,
      upcomingDeadlines,
      profileViews,
      profileCompleteness: this.calculateProfileCompleteness(collegeProfile),
    };
  }

  /**
   * Calculate profile completeness percentage
   */
  private calculateProfileCompleteness(profile: any): number {
    const fields = [
      'institutionName',
      'contactPersonName',
      'institutionType',
      'website',
      'address',
      'city',
      'state',
      'country',
      'postalCode',
      'phone',
      'accreditation',
      'logoUrl',
      'description',
    ];

    const filledFields = fields.filter(field => {
      const value = profile[field];
      return value && value.toString().trim().length > 0;
    });

    return Math.round((filledFields.length / fields.length) * 100);
  }

  /**
   * Check if profile is complete
   */
  private checkProfileCompleteness(profile: any): boolean {
    const requiredFields = [
      'institutionName',
      'contactPersonName',
      'institutionType',
      'address',
      'city',
      'state',
      'country',
      'postalCode',
      'phone',
      'accreditation',
    ];

    return requiredFields.every(field => {
      const value = profile[field];
      return value && value.toString().trim().length > 0;
    });
  }

  /**
   * Search colleges with filters
   */
  async searchColleges(filters: {
    name?: string;
    type?: string;
    city?: string;
    state?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      name,
      type,
      city,
      state,
      country,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const whereConditions: any = {
      isVerified: true,
      user: {
        isActive: true,
        isDeleted: false,
      },
    };

    if (name) {
      whereConditions.institutionName = { contains: name };
    }

    if (type) {
      whereConditions.institutionType = type;
    }

    if (city) {
      whereConditions.city = { contains: city };
    }

    if (state) {
      whereConditions.state = { contains: state };
    }

    if (country) {
      whereConditions.country = { contains: country };
    }

    const [colleges, total] = await Promise.all([
      this.prisma.collegeprofile.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          requirement: {
            where: { isActive: true },
            select: { id: true, title: true, category: true },
            take: 5,
          },
          _count: {
            select: { requirement: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collegeprofile.count({ where: whereConditions }),
    ]);

    return {
      colleges,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get recent requirements for college
   */
  async getRecentRequirements(userId: string, limit: number = 5) {
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found');
    }

    return this.prisma.requirement.findMany({
      where: {
        collegeProfileId: collegeProfile.id,
        // Remove isActive filter so college admins can see ALL their requirements
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        budget: true,
        budgetType: true,
        deadline: true,
        isUrgent: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get requirements summary for dashboard
   */
  async getRequirementsSummary(userId: string) {
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId },
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found');
    }

    const [byCategory, byStatus] = await Promise.all([
      this.prisma.requirement.groupBy({
        by: ['category'],
        where: { collegeProfileId: collegeProfile.id },
        _count: { category: true },
      }),
      this.prisma.requirement.groupBy({
        by: ['isActive'],
        where: { collegeProfileId: collegeProfile.id },
        _count: { isActive: true },
      }),
    ]);

    return {
      byCategory,
      byStatus,
    };
  }
}
