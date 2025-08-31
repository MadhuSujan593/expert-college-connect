import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Create a new notification
  async createNotification(createNotificationDto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        application: {
          include: {
            requirement: true,
            expert: {
              include: {
                expertprofile: true
              }
            }
          }
        }
      }
    });
  }

  // Get user's notifications with pagination
  async getUserNotifications(userId: string, query: GetNotificationsDto) {
    const { page = 1, limit = 20, isRead, type } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          application: {
            include: {
              requirement: true,
              expert: {
                include: {
                  expertprofile: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.notification.count({ where })
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Get unread notification count
  async getUnreadCount(userId: string) {
    return await this.prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return await this.prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  // Create system notification for requirement posted
  async notifyRequirementPosted(requirementId: string, collegeName: string) {
    // Get all experts who might be interested in this category
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId }
    });

    if (!requirement) return;

    // Find experts with matching expertise
    const experts = await this.prisma.expertprofile.findMany({
      where: {
        primaryExpertise: requirement.category,
        // Remove isActive filter as it doesn't exist in schema
      },
      include: {
        user: true
      }
    });

    // Create notifications for relevant experts
    const notifications = experts.map(expert => ({
      userId: expert.userId,
      type: 'REQUIREMENT_POSTED' as const,
      title: 'New Opportunity Available',
      message: `A new ${requirement.category} requirement has been posted by ${collegeName}: "${requirement.title}"`
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications
      });
    }
  }
}
