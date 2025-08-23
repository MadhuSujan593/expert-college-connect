import { Injectable, NotFoundException } from '@nestjs/common';
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

    return {
      ...collegeProfile,
      totalRequirements: (collegeProfile as any)._count.requirement,
      activeRequirements: collegeProfile.requirement.length,
    };
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

    const updatedProfile = await this.prisma.collegeprofile.update({
      where: { userId },
      data: {
        ...updateData,
        isProfileComplete: true, // Mark as complete when updated
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

    return updatedProfile;
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
    ];

    const filledFields = fields.filter(field => {
      const value = profile[field];
      return value && value.toString().trim().length > 0;
    });

    return Math.round((filledFields.length / fields.length) * 100);
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
        isActive: true,
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
