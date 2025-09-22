import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { user_role } from '@prisma/client';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        collegeAdmins,
        experts,
        totalApplications,
        totalRequirements,
        totalRatings,
        recentUsers,
        activeUsers
      ] = await Promise.all([
        // Total users count (excluding SUPER_ADMIN)
        this.prisma.user.count({
          where: { 
            isDeleted: false,
            role: { not: user_role.SUPER_ADMIN }
          }
        }),
        
        // College admins count
        this.prisma.user.count({
          where: { 
            role: user_role.COLLEGE_ADMIN,
            isDeleted: false 
          }
        }),
        
        // Experts count
        this.prisma.user.count({
          where: { 
            role: user_role.EXPERT,
            isDeleted: false 
          }
        }),
        
        // Total applications count
        this.prisma.application.count(),
        
        // Total requirements count
        this.prisma.requirement.count(),
        
        // Total ratings count
        this.prisma.rating.count(),
        
        // Recent users (last 30 days, excluding SUPER_ADMIN)
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            isDeleted: false,
            role: { not: user_role.SUPER_ADMIN }
          }
        }),
        
        // Active users (logged in last 30 days, excluding SUPER_ADMIN)
        this.prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            isDeleted: false,
            role: { not: user_role.SUPER_ADMIN }
          }
        })
      ]);

      return {
        totalUsers,
        collegeAdmins,
        experts,
        totalApplications,
        totalRequirements,
        totalRatings,
        recentUsers,
        activeUsers
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: user_role,
    search?: string,
    isActive?: boolean
  ) {
    try {
      console.log('SuperAdmin Service - getAllUsers called with:', { page, limit, role, search, isActive }); // Debug log
      const skip = (page - 1) * limit;
      
      const where: any = {
        isDeleted: false,
        role: { not: user_role.SUPER_ADMIN } // Exclude SUPER_ADMIN users
      };

      if (role && role !== user_role.SUPER_ADMIN) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            lastLoginAt: true,
            createdAt: true,
            expertprofile: {
              select: {
                id: true,
                jobTitle: true,
                company: true,
                isVerified: true
              }
            },
            collegeprofile: {
              select: {
                id: true,
                institutionName: true,
                isVerified: true
              }
            }
          }
        }),
        this.prisma.user.count({ where })
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  /**
   * Get user by ID with detailed information
   */
  async getUserById(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        include: {
          expertprofile: {
            include: {
              expertskill: true,
              workexperience: true,
              service: true
            }
          },
          collegeprofile: true,
          applications: {
            include: {
              requirement: {
                select: {
                  title: true,
                  category: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          notifications: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user details');
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isDeleted: false }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true
        }
      });

      return {
        user: updatedUser,
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user status');
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string) {
    try {
      console.log('SuperAdmin Service - Deleting user:', userId); // Debug log
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isDeleted: true
        }
      });

      if (!user) {
        throw new NotFoundException('User not found or already deleted');
      }

      // Prevent deletion of SUPER_ADMIN users
      if (user.role === user_role.SUPER_ADMIN) {
        throw new BadRequestException('Cannot delete Super Admin users');
      }

      // Perform soft delete
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('SuperAdmin Service - User soft deleted successfully:', user.email); // Debug log

      return {
        message: `User ${user.fullName} (${user.email}) has been deleted successfully`,
        deletedUser: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      };
    } catch (error) {
      console.error('SuperAdmin Service - Delete user error:', error); // Debug log
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Restore deleted user (undo soft delete)
   */
  async restoreUser(userId: string) {
    try {
      console.log('SuperAdmin Service - Restoring user:', userId); // Debug log
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isDeleted: true },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true
        }
      });

      if (!user) {
        throw new NotFoundException('Deleted user not found');
      }

      // Restore user
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          isDeleted: false,
          isActive: true,
          deletedAt: null,
          updatedAt: new Date()
        }
      });

      console.log('SuperAdmin Service - User restored successfully:', user.email); // Debug log

      return {
        message: `User ${user.fullName} (${user.email}) has been restored successfully`,
        restoredUser: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      };
    } catch (error) {
      console.error('SuperAdmin Service - Restore user error:', error); // Debug log
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to restore user');
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [activities, total] = await Promise.all([
        this.prisma.notification.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            isRead: true,
            createdAt: true
          }
        }),
        this.prisma.notification.count({ where: { userId } })
      ]);

      return {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch user activity');
    }
  }

  /**
   * Get system overview
   */
  async getSystemOverview() {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalApplications,
        pendingApplications,
        totalRequirements,
        activeRequirements,
        totalRatings,
        averageRating
      ] = await Promise.all([
        this.prisma.user.count({ where: { isDeleted: false } }),
        this.prisma.user.count({ where: { isActive: true, isDeleted: false } }),
        this.prisma.user.count({ 
          where: { 
            isEmailVerified: true, 
            isPhoneVerified: true,
            isDeleted: false 
          } 
        }),
        this.prisma.application.count(),
        this.prisma.application.count({ where: { status: 'PENDING' } }),
        this.prisma.requirement.count(),
        this.prisma.requirement.count({ where: { isActive: true } }),
        this.prisma.rating.count(),
        this.prisma.rating.aggregate({
          _avg: { overallRating: true }
        })
      ]);

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications
        },
        requirements: {
          total: totalRequirements,
          active: activeRequirements
        },
        ratings: {
          total: totalRatings,
          average: averageRating._avg.overallRating || 0
        }
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch system overview');
    }
  }
}
