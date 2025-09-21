import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRatingDto: CreateRatingDto, collegeProfileId: string) {
    const { expertProfileId, questions, ...ratingData } = createRatingDto;

    // Verify the expert profile exists
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { id: expertProfileId },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    // Check if college has already rated this expert for the same requirement/application
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        expertProfileId,
        collegeProfileId,
        ...(ratingData.requirementId && { requirementId: ratingData.requirementId }),
        ...(ratingData.applicationId && { applicationId: ratingData.applicationId }),
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this expert for this project');
    }

    // Create the rating with questions
    const rating = await this.prisma.rating.create({
      data: {
        ...ratingData,
        expertProfileId,
        collegeProfileId,
        updatedAt: new Date(),
        ratingQuestions: {
          create: questions.map(q => ({
            question: q.question,
            answer: q.answer,
            category: q.category,
            updatedAt: new Date()
          })),
        },
      },
      include: {
        ratingQuestions: true,
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Update the rating request status to COMPLETED if ratingRequestId is provided
    if (ratingData.ratingRequestId) {
      await this.prisma.ratingrequest.update({
        where: { id: ratingData.ratingRequestId },
        data: { 
          status: 'COMPLETED',
          respondedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return rating;
  }

  async findAll(expertProfileId?: string, collegeProfileId?: string) {
    const where: any = {};

    if (expertProfileId) {
      where.expertProfileId = expertProfileId;
    }

    if (collegeProfileId) {
      where.collegeProfileId = collegeProfileId;
    }

    const ratings = await this.prisma.rating.findMany({
      where,
      include: {
        ratingQuestions: true,
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        collegeprofile: {
          select: {
            id: true,
            institutionName: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ratings;
  }

  async findOne(id: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
      include: {
        ratingQuestions: true,
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        collegeprofile: {
          select: {
            id: true,
            institutionName: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  async update(id: string, updateRatingDto: UpdateRatingDto, collegeProfileId: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.collegeProfileId !== collegeProfileId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    const { questions, ...ratingData } = updateRatingDto;

    // Update rating and questions
    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data: {
        ...ratingData,
        ...(questions && {
          ratingQuestions: {
            deleteMany: {},
            create: questions.map(q => ({
              question: q.question,
              answer: q.answer,
              category: q.category,
              updatedAt: new Date()
            })),
          },
        }),
      },
      include: {
        ratingQuestions: true,
        expertprofile: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return updatedRating;
  }

  async remove(id: string, collegeProfileId: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.collegeProfileId !== collegeProfileId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.prisma.rating.delete({
      where: { id },
    });

    return { message: 'Rating deleted successfully' };
  }

  async getRatingStats(expertProfileId: string) {
    const stats = await this.prisma.rating.aggregate({
      where: { expertProfileId },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    const categoryStats = await this.prisma.ratingquestion.groupBy({
      by: ['category'],
      where: {
        rating: {
          expertProfileId,
        },
      },
      _avg: { answer: true },
      _count: { id: true },
    });

    return {
      overall: {
        average: stats._avg.overallRating || 0,
        total: stats._count.id,
      },
      categories: categoryStats.map(cat => ({
        category: cat.category,
        average: cat._avg.answer || 0,
        count: cat._count.id,
      })),
    };
  }

  async getRatingQuestions() {
    // Return predefined rating questions
    return [
      {
        category: 'communication',
        questions: [
          'How well did the expert communicate throughout the project?',
          'Was the expert responsive to your messages and requests?',
          'Did the expert provide clear and detailed explanations?',
        ],
      },
      {
        category: 'expertise',
        questions: [
          'How would you rate the expert\'s technical knowledge?',
          'Did the expert demonstrate deep understanding of the subject matter?',
          'Was the expert able to solve complex problems effectively?',
        ],
      },
      {
        category: 'timeliness',
        questions: [
          'Did the expert meet all deadlines?',
          'Was the expert punctual for meetings and calls?',
          'How well did the expert manage project timelines?',
        ],
      },
      {
        category: 'quality',
        questions: [
          'How would you rate the quality of work delivered?',
          'Did the expert meet your expectations?',
          'Was the final deliverable professional and well-executed?',
        ],
      },
      {
        category: 'collaboration',
        questions: [
          'How well did the expert work with your team?',
          'Was the expert open to feedback and suggestions?',
          'Did the expert contribute positively to the project environment?',
        ],
      },
    ];
  }
}
