import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingRequestDto } from './dto/create-rating-request.dto';
import { UpdateRatingRequestDto } from './dto/update-rating-request.dto';
import { ratingrequest_status } from '@prisma/client';

@Injectable()
export class RatingRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRatingRequestDto: CreateRatingRequestDto, expertProfileId: string) {
    const { requirementId, applicationId, message } = createRatingRequestDto;

    // Get the expert's userId from the expertProfileId
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { id: expertProfileId },
      select: { userId: true }
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    // Verify the requirement exists
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
      include: { collegeprofile: true }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    // If applicationId is provided, verify the expert applied for this requirement
    if (applicationId) {
      const application = await this.prisma.application.findFirst({
        where: {
          id: applicationId,
          expertId: expertProfile.userId, // Use userId instead of expertProfileId
          requirementId: requirementId
        }
      });

      if (!application) {
        throw new BadRequestException('Application not found or does not belong to this expert');
      }
    }

    // Check if there's already a rating request for this exact requirement and application combination
    console.log('🔍 DEBUG: Checking for existing rating request');
    console.log('  - expertProfileId:', expertProfileId);
    console.log('  - requirementId:', requirementId);
    console.log('  - applicationId:', applicationId);
    
    // Build the exact match criteria - must match BOTH requirementId AND applicationId
    const whereClause: any = {
      expertProfileId,
      requirementId,
      applicationId: applicationId || null  // This ensures exact match
    };
    
    console.log('  - whereClause:', whereClause);
    
    const existingRequest = await this.prisma.ratingrequest.findFirst({
      where: whereClause
    });
    
    console.log('  - found existing request:', existingRequest ? {
      id: existingRequest.id,
      requirementId: existingRequest.requirementId,
      applicationId: existingRequest.applicationId,
      status: existingRequest.status
    } : 'None');

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new BadRequestException('You already have a pending rating request for this specific project');
      } else if (existingRequest.status === 'APPROVED' || existingRequest.status === 'COMPLETED') {
        throw new BadRequestException('You have already requested a rating for this specific project');
      }
    }

    // Create the rating request
    const ratingRequest = await this.prisma.ratingrequest.create({
      data: {
        expertProfileId,
        collegeProfileId: requirement.collegeProfileId,
        requirementId,
        applicationId,
        message,
        status: 'PENDING',
        updatedAt: new Date()
      },
      include: {
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        requirement: {
          select: {
            id: true,
            title: true
          }
        },
        application: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    return ratingRequest;
  }

  async findAll(expertProfileId?: string, collegeProfileId?: string) {
    const where: any = {};

    if (expertProfileId) {
      where.expertProfileId = expertProfileId;
    }

    if (collegeProfileId) {
      where.collegeProfileId = collegeProfileId;
    }

    const ratingRequests = await this.prisma.ratingrequest.findMany({
      where,
      include: {
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        collegeprofile: {
          select: {
            id: true,
            institutionName: true
          }
        },
        requirement: {
          select: {
            id: true,
            title: true
          }
        },
        application: {
          select: {
            id: true,
            status: true
          }
        },
        ratings: {
          include: {
            ratingQuestions: true
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    return ratingRequests;
  }

  async findOne(id: string) {
    const ratingRequest = await this.prisma.ratingrequest.findUnique({
      where: { id },
      include: {
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        collegeprofile: {
          select: {
            id: true,
            institutionName: true
          }
        },
        requirement: {
          select: {
            id: true,
            title: true
          }
        },
        application: {
          select: {
            id: true,
            status: true
          }
        },
        ratings: {
          include: {
            ratingQuestions: true
          }
        }
      }
    });

    if (!ratingRequest) {
      throw new NotFoundException('Rating request not found');
    }

    return ratingRequest;
  }

  async update(id: string, updateRatingRequestDto: UpdateRatingRequestDto, collegeProfileId: string) {
    const ratingRequest = await this.prisma.ratingrequest.findUnique({
      where: { id }
    });

    if (!ratingRequest) {
      throw new NotFoundException('Rating request not found');
    }

    if (ratingRequest.collegeProfileId !== collegeProfileId) {
      throw new ForbiddenException('You can only update rating requests for your college');
    }

    const updatedRatingRequest = await this.prisma.ratingrequest.update({
      where: { id },
      data: {
        ...updateRatingRequestDto,
        ...(updateRatingRequestDto.status && { respondedAt: new Date() })
      },
      include: {
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        collegeprofile: {
          select: {
            id: true,
            institutionName: true
          }
        },
        requirement: {
          select: {
            id: true,
            title: true
          }
        },
        application: {
          select: {
            id: true,
            status: true
          }
        },
        ratings: {
          include: {
            ratingQuestions: true
          }
        }
      }
    });

    return updatedRatingRequest;
  }

  async remove(id: string, expertProfileId: string) {
    const ratingRequest = await this.prisma.ratingrequest.findUnique({
      where: { id }
    });

    if (!ratingRequest) {
      throw new NotFoundException('Rating request not found');
    }

    if (ratingRequest.expertProfileId !== expertProfileId) {
      throw new ForbiddenException('You can only delete your own rating requests');
    }

    await this.prisma.ratingrequest.delete({
      where: { id }
    });

    return { message: 'Rating request deleted successfully' };
  }

  async getStats(expertProfileId?: string, collegeProfileId?: string) {
    const where: any = {};

    if (expertProfileId) {
      where.expertProfileId = expertProfileId;
    }

    if (collegeProfileId) {
      where.collegeProfileId = collegeProfileId;
    }

    const stats = await this.prisma.ratingrequest.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    });

    const total = await this.prisma.ratingrequest.count({ where });

    return {
      total,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
