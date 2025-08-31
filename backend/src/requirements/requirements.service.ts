import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async create(createRequirementDto: CreateRequirementDto, userId: string) {
    console.log('🔍 [RequirementsService] Creating requirement for userId:', userId);
    console.log('🔍 [RequirementsService] CreateRequirementDto:', createRequirementDto);
    
    // Check if user is verified
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isEmailVerified: true, isPhoneVerified: true }
    });

    console.log('🔍 [RequirementsService] User verification status:', user);

    if (!user?.isEmailVerified && !user?.isPhoneVerified) {
      console.log('❌ [RequirementsService] User not verified, throwing ForbiddenException');
      throw new ForbiddenException('User must verify email or phone before creating requirements');
    }

    // Get the college profile for this user
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId }
    });

    console.log('🔍 [RequirementsService] College profile found:', collegeProfile?.id);

    if (!collegeProfile) {
      console.log('❌ [RequirementsService] College profile not found, throwing ForbiddenException');
      throw new ForbiddenException('College profile not found');
    }

    // Extract deadline and remove it from the DTO to avoid type conflicts
    const { deadline, ...requirementDataWithoutDeadline } = createRequirementDto;

    // Prepare the data with proper date parsing
    const requirementData: any = {
      ...requirementDataWithoutDeadline,
      collegeProfileId: collegeProfile.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add deadline as Date object if provided
    if (deadline) {
      requirementData.deadline = new Date(deadline);
    }

    console.log('🔍 [RequirementsService] Final requirement data for Prisma:', requirementData);

    try {
      const result = await this.prisma.requirement.create({
        data: requirementData,
      });
      console.log('✅ [RequirementsService] Requirement created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [RequirementsService] Error creating requirement:', error);
      throw error;
    }
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    // Get the college profile for this user
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId }
    });

    if (!collegeProfile) {
      return { requirements: [], total: 0, page, limit, hasMore: false };
    }

    const skip = (page - 1) * limit;

          const [requirements, total] = await Promise.all([
        this.prisma.requirement.findMany({
          where: { 
            collegeProfileId: collegeProfile.id,
            isActive: true  // Only show active requirements
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.requirement.count({
          where: { 
            collegeProfileId: collegeProfile.id,
            isActive: true  // Count only active requirements
          },
        })
      ]);

    return {
      requirements,
      total,
      page,
      limit,
      hasMore: skip + limit < total
    };
  }

  async findOne(id: string, userId: string) {
    console.log('🔍 [RequirementsService] FINDONE METHOD CALLED');
    console.log('🔍 [RequirementsService] Looking for requirement ID:', id);
    console.log('🔍 [RequirementsService] For user ID:', userId);
    
    try {
      // Get the college profile for this user
      console.log('🔍 [RequirementsService] Step 1: Finding college profile...');
      const collegeProfile = await this.prisma.collegeprofile.findUnique({
        where: { userId }
      });

      console.log('🔍 [RequirementsService] Step 1 RESULT - College profile:', {
        found: !!collegeProfile,
        id: collegeProfile?.id,
        userId: collegeProfile?.userId
      });

      if (!collegeProfile) {
        console.log('❌ [RequirementsService] FINDONE FAILED - College profile not found');
        throw new NotFoundException('College profile not found');
      }

      console.log('🔍 [RequirementsService] Step 2: Searching for requirement in database...');
      console.log('🔍 [RequirementsService] Search criteria: id =', id, 'AND collegeProfileId =', collegeProfile.id);
      
      const requirement = await this.prisma.requirement.findFirst({
        where: { id, collegeProfileId: collegeProfile.id },
      });

      console.log('🔍 [RequirementsService] Step 2 RESULT - Database query result:', {
        found: !!requirement,
        requirementId: requirement?.id,
        requirementTitle: requirement?.title
      });

      if (!requirement) {
        console.log('❌ [RequirementsService] FINDONE FAILED - Requirement not found in database');
        console.log('❌ [RequirementsService] This means either:');
        console.log('❌ [RequirementsService] 1. The requirement ID does not exist');
        console.log('❌ [RequirementsService] 2. The requirement belongs to a different college profile');
        throw new NotFoundException('Requirement not found');
      }

      console.log('✅ [RequirementsService] FINDONE SUCCESS - Requirement found:', {
        id: requirement.id,
        title: requirement.title,
        collegeProfileId: requirement.collegeProfileId
      });
      return requirement;
    } catch (error) {
      console.error('❌ [RequirementsService] FINDONE ERROR - Full error details:');
      console.error('❌ [RequirementsService] Error message:', error.message);
      console.error('❌ [RequirementsService] Error name:', error.name);
      if (error.code) console.error('❌ [RequirementsService] Prisma error code:', error.code);
      throw error;
    }
  }

  async update(id: string, updateRequirementDto: UpdateRequirementDto, userId: string) {
    console.log('🔍 [RequirementsService] UPDATE METHOD CALLED');
    console.log('🔍 [RequirementsService] ID to update:', id);
    console.log('🔍 [RequirementsService] UpdateRequirementDto:', JSON.stringify(updateRequirementDto, null, 2));
    console.log('🔍 [RequirementsService] UserId:', userId);
    
    try {
      // Check if requirement exists and belongs to user
      console.log('🔍 [RequirementsService] Step 1: Checking if requirement exists and belongs to user...');
      const existingRequirement = await this.findOne(id, userId);
      console.log('🔍 [RequirementsService] Step 1 COMPLETED - Existing requirement found:', existingRequirement);

      // Handle deadline parsing - convert string to Date object if provided
      let updateData: any = {
        ...updateRequirementDto,
        updatedAt: new Date(),
      };

      // If deadline is provided as a string, convert it to a Date object
      if (updateData.deadline && typeof updateData.deadline === 'string') {
        updateData.deadline = new Date(updateData.deadline);
        console.log('🔍 [RequirementsService] Deadline converted to Date:', updateData.deadline);
      }
      
      console.log('🔍 [RequirementsService] Step 2: Update data prepared for Prisma:', JSON.stringify(updateData, null, 2));

      console.log('🔍 [RequirementsService] Step 3: Calling Prisma update...');
      const result = await this.prisma.requirement.update({
        where: { id },
        data: updateData,
      });
      
      console.log('✅ [RequirementsService] UPDATE SUCCESSFUL - Result:', result);
      return result;
    } catch (error) {
      console.error('❌ [RequirementsService] UPDATE FAILED - Error details:');
      console.error('❌ [RequirementsService] Error message:', error.message);
      console.error('❌ [RequirementsService] Error name:', error.name);
      console.error('❌ [RequirementsService] Error stack:', error.stack);
      if (error.code) console.error('❌ [RequirementsService] Prisma error code:', error.code);
      if (error.meta) console.error('❌ [RequirementsService] Prisma error meta:', error.meta);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    // Check if requirement exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.requirement.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async findRecentRequirements(userId: string, limit: number = 5) {
    // Get the college profile for this user
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { userId }
    });

    if (!collegeProfile) {
      return [];
    }

    return this.prisma.requirement.findMany({
      where: { 
        collegeProfileId: collegeProfile.id,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
