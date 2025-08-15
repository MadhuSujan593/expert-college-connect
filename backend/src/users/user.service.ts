import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, isActive: true, isDeleted: false },
      include: {
        expertProfile: true,
        collegeProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email, isActive: true, isDeleted: false },
    });
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone, isActive: true, isDeleted: false },
    });
  }

  /**
   * Get users by role
   */
  async findByRole(role: UserRole, page: number = 1, limit: number = 10) {
    return this.prisma.paginate(
      this.prisma.user,
      page,
      limit,
      { role, isActive: true, isDeleted: false },
      { createdAt: 'desc' },
      {
        expertProfile: true,
        collegeProfile: true,
      }
    );
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        expertProfile: true,
        collegeProfile: true,
      },
    });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Soft delete user
   */
  async deleteUser(id: string) {
    return this.prisma.softDelete(this.prisma.user, { id });
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [totalUsers, activeUsers, verifiedUsers] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.user.count({ where: { isActive: true, isDeleted: false } }),
      this.prisma.user.count({ 
        where: { 
          isEmailVerified: true, 
          isActive: true, 
          isDeleted: false 
        } 
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
    };
  }
} 