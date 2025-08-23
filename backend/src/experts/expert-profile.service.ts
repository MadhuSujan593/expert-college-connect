import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateExpertProfileDto, CreateExpertSkillDto, CreateWorkExperienceDto, UpdateWorkExperienceDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExpertProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get expert profile by user ID
   */
  async getProfileByUserId(userId: string) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
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
        expertskill: true,
        workexperience: {
          orderBy: { startDate: 'desc' },
        },
        service: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        rating: {
          include: {
            expertprofile: {
              select: {
                id: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            rating: true,
            service: true,
          },
        },
      },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    // Calculate average rating
    const avgRating = await this.prisma.rating.aggregate({
      where: { expertProfileId: expertProfile.id },
      _avg: { rating: true },
    });

    return {
      ...expertProfile,
      averageRating: avgRating._avg.rating || 0,
      totalRatings: expertProfile._count.rating,
      totalServices: expertProfile._count.service,
    };
  }

  /**
   * Update expert profile
   */
  async updateProfile(userId: string, updateData: UpdateExpertProfileDto) {
    const existingProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    // Parse availableFor if it's a string
    let availableForData = updateData.availableFor;
    if (typeof updateData.availableFor === 'string') {
      try {
        availableForData = JSON.parse(updateData.availableFor);
      } catch (error) {
        availableForData = updateData.availableFor.split(',').map(item => item.trim());
      }
    }

    const updatedProfile = await this.prisma.expertprofile.update({
      where: { userId },
      data: {
        ...updateData,
        availableFor: availableForData,
        hourlyRate: updateData.hourlyRate ? parseFloat(updateData.hourlyRate.toString()) : undefined,
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
        expertskill: true,
      },
    });

    return updatedProfile;
  }

  /**
   * Add skill to expert profile
   */
  async addSkill(userId: string, skillData: CreateExpertSkillDto) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    // Check if skill already exists
    const existingSkill = await this.prisma.expertskill.findFirst({
      where: {
        expertProfileId: expertProfile.id,
        skillName: skillData.skillName,
      },
    });

    if (existingSkill) {
      throw new BadRequestException('Skill already exists');
    }

    return this.prisma.expertskill.create({
      data: {
        id: uuidv4(),
        expertProfileId: expertProfile.id,
        skillName: skillData.skillName,
        skillLevel: skillData.skillLevel || 'INTERMEDIATE',
      },
    });
  }

  /**
   * Update skill
   */
  async updateSkill(userId: string, skillId: string, skillData: Partial<CreateExpertSkillDto>) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    const skill = await this.prisma.expertskill.findFirst({
      where: {
        id: skillId,
        expertProfileId: expertProfile.id,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return this.prisma.expertskill.update({
      where: { id: skillId },
      data: skillData,
    });
  }

  /**
   * Remove skill
   */
  async removeSkill(userId: string, skillId: string) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    const skill = await this.prisma.expertskill.findFirst({
      where: {
        id: skillId,
        expertProfileId: expertProfile.id,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return this.prisma.expertskill.delete({
      where: { id: skillId },
    });
  }

  /**
   * Get expert dashboard stats
   */
  async getDashboardStats(userId: string) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    const [
      totalServices,
      activeServices,
      totalRatings,
      averageRating,
      profileViews,
    ] = await Promise.all([
      this.prisma.service.count({
        where: { expertProfileId: expertProfile.id },
      }),
      this.prisma.service.count({
        where: { expertProfileId: expertProfile.id, isActive: true },
      }),
      this.prisma.rating.count({
        where: { expertProfileId: expertProfile.id },
      }),
      this.prisma.rating.aggregate({
        where: { expertProfileId: expertProfile.id },
        _avg: { rating: true },
      }),
      // Profile views would need to be tracked separately
      0, // Placeholder for now
    ]);

    return {
      totalServices,
      activeServices,
      totalRatings,
      averageRating: averageRating._avg.rating || 0,
      profileViews,
      profileCompleteness: this.calculateProfileCompleteness(expertProfile),
    };
  }

  /**
   * Calculate profile completeness percentage
   */
  private calculateProfileCompleteness(profile: any): number {
    const fields = [
      'jobTitle',
      'company',
      'experience',
      'location',
      'primaryExpertise',
      'bio',
      'hourlyRate',
      'availableFor',
      'preferredMode',
    ];

    const filledFields = fields.filter(field => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim().length > 0;
    });

    return Math.round((filledFields.length / fields.length) * 100);
  }

  /**
   * Add work experience
   */
  async addWorkExperience(userId: string, experienceData: CreateWorkExperienceDto) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    // Parse skills if it's provided
    let skillsData: any = experienceData.skills;
    if (typeof experienceData.skills === 'string' && experienceData.skills) {
      try {
        skillsData = JSON.parse(experienceData.skills);
      } catch (error) {
        skillsData = (experienceData.skills as string).split(',').map(skill => skill.trim());
      }
    }

    return this.prisma.workexperience.create({
      data: {
        id: uuidv4(),
        expertProfileId: expertProfile.id,
        jobTitle: experienceData.jobTitle,
        company: experienceData.company,
        location: experienceData.location,
        startDate: new Date(experienceData.startDate),
        endDate: experienceData.endDate ? new Date(experienceData.endDate) : null,
        isCurrent: experienceData.isCurrent || false,
        description: experienceData.description,
        skills: skillsData,
        achievements: experienceData.achievements,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update work experience
   */
  async updateWorkExperience(userId: string, experienceId: string, experienceData: UpdateWorkExperienceDto) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    const experience = await this.prisma.workexperience.findFirst({
      where: {
        id: experienceId,
        expertProfileId: expertProfile.id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    // Parse skills if it's provided
    let skillsData: any = experienceData.skills;
    if (typeof experienceData.skills === 'string' && experienceData.skills) {
      try {
        skillsData = JSON.parse(experienceData.skills);
      } catch (error) {
        skillsData = (experienceData.skills as string).split(',').map(skill => skill.trim());
      }
    }

    const updateData: any = { ...experienceData };
    if (experienceData.startDate) {
      updateData.startDate = new Date(experienceData.startDate);
    }
    if (experienceData.endDate) {
      updateData.endDate = new Date(experienceData.endDate);
    }
    if (skillsData !== undefined) {
      updateData.skills = skillsData;
    }

    return this.prisma.workexperience.update({
      where: { id: experienceId },
      data: updateData,
    });
  }

  /**
   * Remove work experience
   */
  async removeWorkExperience(userId: string, experienceId: string) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    const experience = await this.prisma.workexperience.findFirst({
      where: {
        id: experienceId,
        expertProfileId: expertProfile.id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    return this.prisma.workexperience.delete({
      where: { id: experienceId },
    });
  }

  /**
   * Get work experiences for expert
   */
  async getWorkExperiences(userId: string) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    return this.prisma.workexperience.findMany({
      where: { expertProfileId: expertProfile.id },
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' },
      ],
    });
  }

  /**
   * Search experts with filters
   */
  async searchExperts(filters: {
    expertise?: string;
    location?: string;
    experience?: string;
    minRating?: number;
    maxHourlyRate?: number;
    availableFor?: string[];
    page?: number;
    limit?: number;
  }) {
    const {
      expertise,
      location,
      experience,
      minRating,
      maxHourlyRate,
      availableFor,
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

    if (expertise) {
      whereConditions.OR = [
        { primaryExpertise: { contains: expertise } },
        { skills: { some: { skillName: { contains: expertise } } } },
      ];
    }

    if (location) {
      whereConditions.location = { contains: location };
    }

    if (experience) {
      whereConditions.experience = { contains: experience };
    }

    if (maxHourlyRate) {
      whereConditions.hourlyRate = { lte: maxHourlyRate };
    }

    if (availableFor && availableFor.length > 0) {
      // This would need to be adjusted based on how availableFor is stored
      whereConditions.availableFor = { hasSome: availableFor };
    }

    const [experts, total] = await Promise.all([
      this.prisma.expertprofile.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          expertskill: true,
          rating: {
            select: { rating: true },
          },
          _count: {
            select: { rating: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expertprofile.count({ where: whereConditions }),
    ]);

    // Filter by minimum rating if specified
    let filteredExperts = experts;
    if (minRating) {
      filteredExperts = experts.filter(expert => {
                const expertRating = (expert as any).rating || [];
        const avgRating = expertRating.length > 0
          ? expertRating.reduce((sum, r) => sum + r.rating, 0) / expertRating.length
          : 0;
        return avgRating >= minRating;
      });
    }

    return {
      experts: filteredExperts.map(expert => ({
        ...expert,
                averageRating: ((expert as any).rating || []).length > 0
          ? ((expert as any).rating || []).reduce((sum, r) => sum + r.rating, 0) / ((expert as any).rating || []).length
          : 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
