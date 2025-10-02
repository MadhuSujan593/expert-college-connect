import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // Get messages for a specific application
  async getApplicationMessages(applicationId: string, userId: string) {
    // Verify user has access to this application
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        expert: true,
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

    // Check if user is the expert or college admin
    const isExpert = application.expertId === userId;
    const isCollegeAdmin = application.requirement.collegeprofile.userId === userId;

    if (!isExpert && !isCollegeAdmin) {
      throw new ForbiddenException('Access denied');
    }

    // Get messages between the expert and college admin
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: application.expertId,
            receiverId: application.requirement.collegeprofile.userId
          },
          {
            senderId: application.requirement.collegeprofile.userId,
            receiverId: application.expertId
          }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    return messages;
  }

  // Send a message for a specific application
  async sendApplicationMessage(applicationId: string, createMessageDto: CreateMessageDto, senderId: string) {
    const { content } = createMessageDto;

    // Verify user has access to this application
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        expert: true,
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

    // Check if user is the expert or college admin
    const isExpert = application.expertId === senderId;
    const isCollegeAdmin = application.requirement.collegeprofile.userId === senderId;

    if (!isExpert && !isCollegeAdmin) {
      throw new ForbiddenException('Access denied');
    }

    // Determine receiver ID
    const receiverId = isExpert 
      ? application.requirement.collegeprofile.userId 
      : application.expertId;

    // Create message
    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        subject: `Application: ${application.requirement.title}`,
        content,
        createdAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    // Create notification for receiver
    await this.prisma.notification.create({
      data: {
        userId: receiverId,
        applicationId: applicationId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You received a new message regarding your application for "${application.requirement.title}"`
      }
    });

    return message;
  }
}












