import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { EmailService } from '../services/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
    private emailService: EmailService
  ) {}

  // Create a new application
  async createApplication(createApplicationDto: CreateApplicationDto, expertId: string) {
    const { requirementId, coverLetter, proposedBudget, proposedTimeline, relevantExperience, attachments } = createApplicationDto;

    // Check if requirement exists and is active
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
      include: { collegeprofile: { include: { user: true } } }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (!requirement.isActive) {
      throw new BadRequestException('This requirement is no longer active');
    }

    // Check if expert already applied
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        requirementId,
        expertId
      }
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this requirement');
    }

    // Check expert subscription limits
    await this.subscriptionsService.assertExpertCanApplyToJobs(expertId);

    // Create application
    const application = await this.prisma.application.create({
      data: {
        requirementId,
        expertId,
        coverLetter,
        proposedBudget,
        proposedTimeline,
        relevantExperience,
        attachments,
        updatedAt: new Date()
      },
      include: {
        requirement: {
          include: {
            collegeprofile: {
              include: { user: true }
            }
          }
        },
        expert: {
          include: {
            expertprofile: true
          }
        }
      }
    });

    // Create notification for college admin
    await this.prisma.notification.create({
      data: {
        userId: requirement.collegeprofile.userId,
        applicationId: application.id,
        type: 'APPLICATION_SUBMITTED',
        title: 'New Application',
        message: `Great news! A new expert has submitted an application for your requirement: "${requirement.title}"`
      }
    });

    // Send email notification to college admin
    const collegeUser = requirement.collegeprofile.user;
    if (collegeUser && collegeUser.email) {
      try {
        // Get expert user data - expert relation points to user table
        const expertUser = application.expert;
        const expertName = expertUser?.fullName || 'Expert';
        const expertExpertise = application.expert.expertprofile?.primaryExpertise || 'Expert';
        
        await this.emailService.sendNewApplicationEmail(
          collegeUser.email,
          collegeUser.fullName || collegeUser.email,
          expertName,
          expertExpertise,
          requirement.title,
          application.id
        );
      } catch (error) {
        console.error('Failed to send new application email:', error);
        console.error('Error details:', {
          collegeEmail: collegeUser?.email,
          collegeName: collegeUser?.fullName,
          expertId: application.expertId,
          applicationId: application.id,
          errorMessage: error?.message,
          errorStack: error?.stack
        });
        // Don't throw error, just log it
      }
    } else {
      console.warn('Cannot send email: college user or email not found', {
        collegeUserId: requirement.collegeprofile.userId,
        hasCollegeUser: !!collegeUser,
        hasEmail: !!collegeUser?.email
      });
    }

    // Increment expert application usage
    await this.subscriptionsService.incrementExpertApplicationUsage(expertId);

    return application;
  }

  // Get all applications for a college admin across all requirements
  async getCollegeApplications(collegeAdminId: string, query: GetApplicationsDto) {
    const { page = 1, limit = 10, status, search, requirementId } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      requirement: {
        collegeprofile: {
          userId: collegeAdminId
        }
      }
    };
    
    if (status) where.status = status;
    if (requirementId) where.requirementId = requirementId;
    if (search) {
      where.OR = [
        { expert: { fullName: { contains: search, mode: 'insensitive' } } },
        { expert: { expertprofile: { primaryExpertise: { contains: search, mode: 'insensitive' } } } },
        { coverLetter: { contains: search, mode: 'insensitive' } },
        { requirement: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          expert: {
            include: {
              expertprofile: {
                include: {
                  expertskill: true,
                  workexperience: {
                    orderBy: { startDate: 'desc' }
                  }
                }
              }
            }
          },
          requirement: {
            include: {
              collegeprofile: {
                include: { user: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.application.count({ where })
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get applications for a requirement (college admin view)
  async getRequirementApplications(requirementId: string, collegeAdminId: string, query: GetApplicationsDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    // Verify college admin owns this requirement
    const requirement = await this.prisma.requirement.findFirst({
      where: {
        id: requirementId,
        collegeprofile: {
          userId: collegeAdminId
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found or access denied');
    }

    // Build where clause
    const where: any = { requirementId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { expert: { fullName: { contains: search, mode: 'insensitive' } } },
        { expert: { expertprofile: { primaryExpertise: { contains: search, mode: 'insensitive' } } } },
        { coverLetter: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          expert: {
            include: {
              expertprofile: {
                include: {
                  expertskill: true,
                  workexperience: {
                    orderBy: { startDate: 'desc' }
                  }
                }
              }
            }
          },
          requirement: {
            include: {
              collegeprofile: {
                include: { user: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.application.count({ where })
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get expert's applications
  async getExpertApplications(expertId: string, query: GetApplicationsDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { expertId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { requirement: { title: { contains: search, mode: 'insensitive' } } },
        { requirement: { description: { contains: search, mode: 'insensitive' } } },
        { requirement: { category: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          requirement: {
            include: {
              collegeprofile: {
                include: { user: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.application.count({ where })
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Update application status (college admin action)
  async updateApplicationStatus(
    applicationId: string, 
    updateDto: UpdateApplicationStatusDto, 
    collegeAdminId: string
  ) {
    const { status, reviewNotes } = updateDto;

    // Get application with requirement details
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        requirement: {
          include: {
            collegeprofile: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify college admin owns this requirement
    if (application.requirement.collegeprofile.userId !== collegeAdminId) {
      throw new ForbiddenException('Access denied');
    }

    // Update application
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: collegeAdminId,
        isShortlisted: status === 'SHORTLISTED',
        shortlistedAt: status === 'SHORTLISTED' ? new Date() : null
      },
      include: {
        expert: {
          include: {
            expertprofile: true
          }
        },
        requirement: {
          include: {
            collegeprofile: {
              include: { user: true }
            }
          }
        }
      }
    });

    // Create notification for expert
    await this.prisma.notification.create({
      data: {
        userId: application.expertId,
        applicationId: application.id,
        type: 'APPLICATION_STATUS_UPDATED',
        title: 'Application Status Updated',
        message: `Your application for "${application.requirement.title}" has been ${status.toLowerCase()}`
      }
    });

    // Send email notification to expert for SHORTLISTED or REJECTED status
    if (status === 'SHORTLISTED' || status === 'REJECTED') {
      const expertUser = updatedApplication.expert;
      if (expertUser && expertUser.email) {
        try {
          await this.emailService.sendApplicationStatusUpdateEmail(
            expertUser.email,
            expertUser.fullName,
            application.requirement.title,
            application.requirement.collegeprofile.institutionName,
            status,
            reviewNotes || undefined
          );
        } catch (error) {
          console.error('Failed to send application status update email:', error);
          // Don't throw error, just log it
        }
      }
    }

    return updatedApplication;
  }

  // Get application by ID
  async getApplicationById(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        requirement: {
          include: {
            collegeprofile: {
              include: { user: true }
            }
          }
        },
        expert: {
          include: {
            expertprofile: {
              include: {
                expertskill: true,
                workexperience: {
                  orderBy: { startDate: 'desc' }
                }
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check access permissions
    if (application.expertId !== userId && 
        application.requirement.collegeprofile.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return application;
  }

  // Withdraw application (expert action)
  async withdrawApplication(applicationId: string, expertId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        expertId
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Cannot withdraw application that is not pending');
    }

    return await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' }
    });
  }
}
