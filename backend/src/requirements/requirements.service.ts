import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { GetRequirementsDto } from './dto/get-requirements.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService, private subscriptions: SubscriptionsService) {}

  // Create a new requirement
  async create(createRequirementDto: CreateRequirementDto, userId: string) {
    // First, get the college profile ID for this user
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found for this user');
    }

    // Enforce subscription gate for college requirement creation
    await this.subscriptions.assertCollegeCanCreateRequirement(userId);

    // Convert deadline to proper ISO DateTime format if provided
    const formattedDeadline = createRequirementDto.deadline 
      ? new Date(createRequirementDto.deadline).toISOString()
      : null;

    const { requiredSkills, experience, ...requirementData } = createRequirementDto;
    
    const requirement = await this.prisma.requirement.create({
      data: {
        ...requirementData,
        deadline: formattedDeadline,
        collegeProfileId: collegeProfile.id,
        updatedAt: new Date()
      },
      include: {
        collegeprofile: {
          include: {
            user: true
          }
        }
      }
    });

    // Increment usage counter
    await this.subscriptions.incrementRequirementUsage(userId);

    return requirement;
  }

    // Get all requirements with pagination and filters (for experts to browse)
  async findAll(query: any, userId: string, filterByCollege: boolean = true) {
    // Safely extract and validate query parameters
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20; // Optimized default limit
    const category = query.category;
    const search = query.search;
    
    const skip = (page - 1) * limit;

    // Build where clause - simple and clean
    const where: any = { 
      isActive: true
    };
    
    // Only filter by college profile if requested (for college users)
    if (filterByCollege) {
      where.collegeprofile = {
        userId: userId
      };
    }
    
    if (category && category !== 'All Categories') {
      where.category = category;
    }
    
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [requirements, total] = await Promise.all([
      this.prisma.requirement.findMany({
        where,
        select: { // Only select needed fields for performance
          id: true,
          title: true,
          description: true,
          category: true,
          subcategory: true,
          budget: true,
          budgetType: true,
          deadline: true,
          isUrgent: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          collegeProfileId: true,
          collegeprofile: {
            select: {
              id: true,
              institutionName: true,
              city: true,
              state: true,
              country: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: [
          { isUrgent: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.requirement.count({ where })
    ]);

    return {
      requirements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };
  }

  // Get requirements for a specific college
  async findByCollege(collegeProfileId: string, query: GetRequirementsDto) {
    const { page = 1, limit = 10, category, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = { collegeProfileId };
    
    if (category && category !== 'All Categories') {
      where.category = category;
    }
    
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

          const [requirements, total] = await Promise.all([
        this.prisma.requirement.findMany({
        where,
        include: {},
          orderBy: { createdAt: 'desc' },
          skip,
        take: limit
      }),
      this.prisma.requirement.count({ where })
      ]);

    return {
      requirements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get a specific requirement
  async findOne(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        collegeprofile: {
          include: {
            user: true
          }
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    return requirement;
  }

  // Update a requirement
  async update(id: string, updateRequirementDto: UpdateRequirementDto, userId: string) {
    // Verify ownership
    const requirement = await this.prisma.requirement.findFirst({
      where: {
        id,
        collegeprofile: {
          userId
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found or access denied');
    }

    // Convert deadline to proper ISO DateTime format if provided
    const formattedDeadline = updateRequirementDto.deadline 
      ? new Date(updateRequirementDto.deadline).toISOString()
      : undefined;

    // Prepare update data with formatted deadline
    const { requiredSkills, experience, ...requirementData } = updateRequirementDto;
    const updateData = {
      ...requirementData,
      deadline: formattedDeadline,
      updatedAt: new Date()
    };

    return await this.prisma.requirement.update({
      where: { id },
      data: updateData,
      include: {
        collegeprofile: {
          include: {
            user: true
          }
        }
      }
    });
  }

  // Delete a requirement
  async remove(id: string, userId: string) {
    // Verify ownership
    const requirement = await this.prisma.requirement.findFirst({
      where: {
        id,
        collegeprofile: {
          userId
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found or access denied');
    }

    return await this.prisma.requirement.delete({
      where: { id }
    });
  }

  // Get requirement categories for filtering
  async getCategories() {
    const categories = await this.prisma.requirement.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    return categories.map(cat => cat.category);
  }

  // Get recent requirements for dashboard
  async getRecentRequirements(userId: string, limit: number = 5) {
    return await this.prisma.requirement.findMany({
      where: { 
        collegeprofile: {
          userId
        },
        isActive: true
      },
      include: {
        collegeprofile: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}
