import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { user_role } from '@prisma/client';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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
            profileImage: true,
            expertprofile: {
              select: {
                id: true,
                jobTitle: true,
                company: true,
                isVerified: true,
                profilePicture: true
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

  // ===== Plans Management =====
  async listPlans() {
    return this.prisma.subscriptionplan.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async listActivePlans() {
    return this.prisma.subscriptionplan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPlan(dto: CreatePlanDto) {
    try {
      return await this.prisma.subscriptionplan.create({
        data: {
          name: dto.name,
          audience: dto.audience,
          planType: dto.planType,
          billingPeriod: dto.billingPeriod,
          durationDays: dto.durationDays,
          priceCents: dto.priceCents,
          currency: dto.currency ?? 'INR',
          maxRequirements: null, // Unlimited
          maxExpertContacts: null, // Unlimited
          isActive: true, // Explicitly set to active
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      throw new BadRequestException('Failed to create plan');
    }
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    try {
      return await this.prisma.subscriptionplan.update({
        where: { id },
        data: {
          ...dto,
        },
      });
    } catch (e) {
      throw new NotFoundException('Plan not found');
    }
  }

  async togglePlan(id: string) {
    const plan = await this.prisma.subscriptionplan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return this.prisma.subscriptionplan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.subscriptionplan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    const subscribers = await this.prisma.subscription.count({ where: { planId: id, status: { in: ['ACTIVE', 'PAST_DUE'] } } });
    if (subscribers > 0) {
      throw new BadRequestException('Cannot delete a plan with active subscribers');
    }
    await this.prisma.subscriptionplan.delete({ where: { id } });
    return { success: true };
  }

  // ===== Subscriptions visibility =====
  async listSubscriptions(params: { page: number; limit: number; userId?: string; planId?: string; status?: string; }) {
    const { page, limit, userId, planId, status } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (userId) where.userId = userId;
    if (planId) where.planId = planId;
    if (status) where.status = status as any;

    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true, role: true } },
          plan: true,
          usages: {
            orderBy: { periodStart: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscription(id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
        plan: true,
        usages: true,
      },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async createSubscription(dto: { userId: string; planId: string; startsAt?: string; autoRenews?: boolean; }) {
    const plan = await this.prisma.subscriptionplan.findUnique({ where: { id: dto.planId } });
    if (!plan || !plan.isActive) throw new BadRequestException('Invalid or inactive plan');

    // expire any existing active subs for the user in the same audience
    const existing = await this.prisma.subscription.findFirst({
      where: { userId: dto.userId, status: 'ACTIVE' },
      include: { plan: true },
    });
    if (existing && existing.plan.audience === plan.audience) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'EXPIRED', endsAt: new Date() },
      });
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : new Date();
    // naive end date based on billing period
    const endsAt = new Date(startsAt);
    if (plan.billingPeriod === 'MONTHLY') endsAt.setMonth(endsAt.getMonth() + 1);
    if (plan.billingPeriod === 'QUARTERLY') endsAt.setMonth(endsAt.getMonth() + 3);
    if (plan.billingPeriod === 'YEARLY') endsAt.setFullYear(endsAt.getFullYear() + 1);

    return this.prisma.subscription.create({
      data: {
        userId: dto.userId,
        planId: dto.planId,
        status: 'ACTIVE',
        startsAt,
        endsAt,
        autoRenews: dto.autoRenews ?? true,
        updatedAt: new Date(),
      },
    });
  }

  async cancelSubscription(id: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELED', canceledAt: new Date(), autoRenews: false },
    });
  }

  async listPlanSubscribers(planId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { planId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true, role: true } },
          usages: {
            orderBy: { periodStart: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.subscription.count({ where: { planId } }),
    ]);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get invoice details with subscription and payment information
   */
  async getInvoiceDetails(page: number, limit: number, status?: string, planId?: string, search?: string, paymentStatus?: string) {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    // Add non-search filters
    if (status) {
      where.status = status;
    }
    
    if (planId) {
      where.planId = planId;
    }
    
    // Handle search - combine with other filters using AND
    if (search) {
      where.AND = [
        {
          OR: [
            { user: { fullName: { contains: search } } },
            { user: { email: { contains: search } } },
            { plan: { name: { contains: search } } },
          ]
        }
      ];
      
      // Add existing filters to AND array
      if (status) {
        where.AND.push({ status: status });
      }
      if (planId) {
        where.AND.push({ planId: planId });
      }
      
      // Remove individual filters since they're now in AND
      delete where.status;
      delete where.planId;
    }

    // First, get all subscriptions that match the basic filters
    const allSubscriptions = await this.prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            createdAt: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            audience: true,
            billingPeriod: true,
            priceCents: true,
            currency: true,
            maxRequirements: true,
            maxExpertContacts: true,
          },
        },
        usages: {
          orderBy: { periodStart: 'desc' },
          take: 1,
        },
      },
    });

    // Get payment information for each subscription
    const subscriptionsWithPayments = await Promise.all(
      allSubscriptions.map(async (subscription) => {
        // Find payment records for this subscription
        const payments = await this.prisma.payment.findMany({
          where: {
            userId: subscription.userId,
            createdAt: {
              gte: subscription.startsAt,
              lte: subscription.endsAt || new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Calculate total amount paid
        const totalPaid = payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + Number(p.amount), 0);

        // Get the most recent payment for this subscription
        const lastPayment = payments.find(p => p.status === 'COMPLETED') || payments[0] || null;

        return {
          ...subscription,
          payments,
          totalPaid,
          paymentCount: payments.length,
          lastPayment,
          // Add payment status for this subscription
          paymentStatus: payments.length > 0 ? payments[0].status : 'NO_PAYMENT',
        };
      })
    );

    // Filter by payment status if specified
    let filteredSubscriptions = subscriptionsWithPayments;
    if (paymentStatus) {
      filteredSubscriptions = subscriptionsWithPayments.filter(sub => {
        if (paymentStatus === 'NO_PAYMENT') {
          return sub.paymentStatus === 'NO_PAYMENT';
        }
        return sub.paymentStatus === paymentStatus;
      });
    }

    // Apply pagination to filtered results
    const totalFiltered = filteredSubscriptions.length;
    const paginatedSubscriptions = filteredSubscriptions.slice(skip, skip + limit);

    // Calculate total revenue from completed payments
    const userIds = filteredSubscriptions.map(sub => sub.userId);
    
    const revenueQuery = await this.prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        userId: { in: userIds },
      },
      _sum: { amount: true },
    });

    return {
      subscriptions: paginatedSubscriptions,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / limit),
      },
      stats: {
        totalSubscriptions: totalFiltered,
        totalRevenue: Number(revenueQuery._sum?.amount || 0),
      },
    };
  }

  /**
   * Get all subscribers with active subscriptions
   */
  async getAllSubscribers(page: number, limit: number, audience?: string, planId?: string, search?: string) {
    const skip = (page - 1) * limit;
    
    const whereConditions: any = {
      status: 'ACTIVE',
      OR: [
        { endsAt: null },
        { endsAt: { gt: new Date() } },
      ],
    };

    if (planId) {
      whereConditions.planId = planId;
    }

    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { 
            select: { 
              id: true, 
              email: true, 
              fullName: true, 
              role: true,
              isActive: true,
              profileImage: true,
              expertprofile: {
                select: {
                  profilePicture: true
                }
              }
            } 
          },
          plan: {
            select: {
              id: true,
              name: true,
              audience: true,
              priceCents: true,
              currency: true,
              billingPeriod: true
            }
          },
          usages: {
            orderBy: { periodStart: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.subscription.count({ where: whereConditions }),
    ]);

    // Filter by audience and search if provided
    let filteredItems = items;
    if (audience) {
      filteredItems = filteredItems.filter(item => item.plan.audience === audience);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.user.fullName?.toLowerCase().includes(searchLower) ||
        item.user.email?.toLowerCase().includes(searchLower) ||
        item.plan.name?.toLowerCase().includes(searchLower)
      );
    }

    return {
      items: filteredItems,
      pagination: {
        page,
        limit,
        total: filteredItems.length,
        pages: Math.ceil(filteredItems.length / limit),
      },
    };
  }

  /**
   * Create account for expert or college admin using existing auth service logic
   */
  async createAccount(dto: CreateAccountDto) {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.email },
            { phone: dto.phone || undefined }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === dto.email) {
          throw new BadRequestException('Email already registered');
        }
        if (dto.phone && existingUser.phone === dto.phone) {
          throw new BadRequestException('Phone number already registered');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user with profile in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user - super admin created accounts are pre-verified
        const user = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            fullName: dto.fullName,
            role: dto.role,
            isEmailVerified: true, // Super admin created accounts are pre-verified
            isPhoneVerified: dto.phone ? true : false, // Super admin created accounts are pre-verified
            updatedAt: new Date(),
          },
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            role: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          }
        });

        // Create Expert Profile if role is EXPERT
        if (dto.role === user_role.EXPERT) {
          const expertProfile = await prisma.expertprofile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              jobTitle: dto.jobTitle || '',
              company: dto.company || '',
              experience: dto.experience || '',
              primaryExpertise: dto.primaryExpertise || '',
              bio: dto.bio || '',
              availableFor: dto.availableFor ? JSON.parse(dto.availableFor) : null,
              preferredMode: dto.preferredMode || '',
              hourlyRate: dto.hourlyRate ? parseFloat(dto.hourlyRate.toString()) : null,
              updatedAt: new Date(),
            }
          });

          // Create Expert Skills if skills are provided
          if (dto.skills) {
            const skillsArray = dto.skills.split(',').map(skill => skill.trim());
            for (const skillName of skillsArray) {
              if (skillName) {
                await prisma.expertskill.create({
                  data: {
                    id: uuidv4(),
                    expertProfileId: expertProfile.id,
                    skillName: skillName,
                    skillLevel: 'INTERMEDIATE'
                  }
                });
              }
            }
          }
        }

        // Create College Profile if role is COLLEGE_ADMIN
        if (dto.role === user_role.COLLEGE_ADMIN) {
          // Validate and set institution type
          const validInstitutionType = this.validateInstitutionType(dto.institutionType);
          
          await prisma.collegeprofile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              institutionName: dto.institutionName || '',
              contactPersonName: dto.contactPersonName || '',
              institutionType: validInstitutionType,
              website: dto.institutionWebsite || '',
              address: dto.institutionAddress || '',
              city: '',
              state: '',
              country: '',
              postalCode: '',
              updatedAt: new Date(),
            }
          });
        }

        return user;
      });

      // Get the created user with profile
      const createdUser = await this.prisma.user.findUnique({
        where: { id: result.id },
        include: {
          expertprofile: dto.role === user_role.EXPERT,
          collegeprofile: dto.role === user_role.COLLEGE_ADMIN,
        }
      });

      return {
        user: createdUser,
        message: `${dto.role === user_role.EXPERT ? 'Expert' : 'College Admin'} account created successfully`
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create account');
    }
  }

  /**
   * Validate Institution Type
   */
  private validateInstitutionType(type: string | undefined): 'UNIVERSITY' | 'COLLEGE' | 'INSTITUTE' | 'SCHOOL' | 'OTHER' {
    const validTypes = ['UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'SCHOOL', 'OTHER'];
    if (type && validTypes.includes(type.toUpperCase())) {
      return type.toUpperCase() as 'UNIVERSITY' | 'COLLEGE' | 'INSTITUTE' | 'SCHOOL' | 'OTHER';
    }
    return 'UNIVERSITY'; // Default fallback
  }

  /**
   * Update subscription expiration date
   */
  async updateSubscriptionExpiration(subscriptionId: string, newExpirationDate: string) {
    try {
      const parsedDate = new Date(newExpirationDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { user: true, plan: true }
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          endsAt: parsedDate,
          updatedAt: new Date(),
        },
        include: {
          user: { 
            select: { 
              id: true, 
              email: true, 
              fullName: true, 
              role: true,
              isActive: true
            } 
          },
          plan: {
            select: {
              id: true,
              name: true,
              audience: true,
              priceCents: true,
              currency: true,
              billingPeriod: true
            }
          },
        },
      });

      return updatedSubscription;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update subscription expiration');
    }
  }
}
