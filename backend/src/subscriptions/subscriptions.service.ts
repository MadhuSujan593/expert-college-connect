import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CashfreeService } from '../services/cashfree.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService, private readonly cashfree: CashfreeService) {}

  // Calculate dynamic pricing based on billing period
  calculateDynamicPrice(plan: any, billingPeriod: string): number {
    if (plan.priceCents === 0) return 0; // Free plans
    
    const basePrice = plan.priceCents; // Monthly price from database
    const multipliers = {
      'MONTHLY': 1,
      'QUARTERLY': 3,
      'SEMIANNUAL': 6,
      'YEARLY': 12
    };
    
    const discounts = {
      'MONTHLY': 0,
      'QUARTERLY': 13,
      'SEMIANNUAL': 23,
      'YEARLY': 33
    };
    
    const fullPrice = basePrice * multipliers[billingPeriod];
    const discount = discounts[billingPeriod] || 0;
    
    return Math.round(fullPrice * (1 - discount / 100));
  }

  async getActiveSubscriptionForUser(userId: string) {
    const now = new Date();
    console.log('Fetching subscription for user:', userId, 'at time:', now.toISOString());
    
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [
          { endsAt: null },
          { endsAt: { gt: now } },
        ],
      },
      include: {
        plan: true,
        usages: {
          orderBy: { periodStart: 'desc' },
          take: 1,
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            usedRequirements: true,
            usedExpertContacts: true,
            revealedExpertIds: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    
    console.log('Found subscription:', subscription);
    console.log('Subscription usages:', subscription?.usages);
    return subscription;
  }

  private getPeriodBounds(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
    return { periodStart: start, periodEnd: end };
  }

  async getOrCreateUsage(subscriptionId: string, at: Date = new Date()) {
    const { periodStart, periodEnd } = this.getPeriodBounds(at);
    let usage = await this.prisma.subscriptionusage.findFirst({
      where: { subscriptionId, periodStart, periodEnd },
    });
    if (!usage) {
      usage = await this.prisma.subscriptionusage.create({
        data: { subscriptionId, periodStart, periodEnd, createdAt: new Date(), updatedAt: new Date() },
      });
    }
    return usage;
  }

  async listActivePlans(audience?: 'COLLEGE' | 'EXPERT') {
    return this.prisma.subscriptionplan.findMany({
      where: {
        isActive: true,
        ...(audience ? { audience } : {}),
      },
      orderBy: { priceCents: 'asc' },
    });
  }

  // List active plans filtered by user's subscription history
  async listActivePlansForUser(userId: string, audience?: 'COLLEGE' | 'EXPERT') {
    // Check if user has any ACTIVE subscription
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: { 
        userId, 
        status: 'ACTIVE',
        OR: [
          { endsAt: null },
          { endsAt: { gt: new Date() } }
        ]
      },
      include: { plan: true },
    });

    // Check if user has any subscription history (including expired ones)
    const userSubscriptionHistory = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    // If user has no subscription history at all, show all plans (including free)
    if (!userSubscriptionHistory) {
      return this.listActivePlans(audience);
    }

    // If user has an ACTIVE subscription, show all plans (they can upgrade/downgrade)
    if (activeSubscription) {
      return this.listActivePlans(audience);
    }

    // If user has subscription history but no active subscription (expired/cancelled),
    // filter out free plans (they've already used their free trial)
    return this.prisma.subscriptionplan.findMany({
      where: {
        isActive: true,
        planType: 'PAID', // Only show paid plans
        ...(audience ? { audience } : {}),
      },
      orderBy: { priceCents: 'asc' },
    });
  }

  async createUserSubscription(userId: string, planId: string, autoRenews: boolean = true, startsAt?: Date) {
    const plan = await this.prisma.subscriptionplan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found or inactive');

    // expire any existing active subs for the user in the same audience
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });
    if (existing && existing.plan.audience === plan.audience) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'EXPIRED', endsAt: new Date() },
      });
    }

    const start = startsAt ?? new Date();
    const endsAt = new Date(start);
    if (plan.billingPeriod === 'MONTHLY') endsAt.setMonth(endsAt.getMonth() + 1);
    if (plan.billingPeriod === 'QUARTERLY') endsAt.setMonth(endsAt.getMonth() + 3);
    if (plan.billingPeriod === 'YEARLY') endsAt.setFullYear(endsAt.getFullYear() + 1);

    return this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        startsAt: start,
        endsAt,
        autoRenews: autoRenews,
        updatedAt: new Date(),
      },
      include: { plan: true },
    });
  }

  async assertCollegeCanCreateRequirement(userId: string) {
    // Fetch active subscription and plan
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }
    if (subscription.plan.audience !== 'COLLEGE') {
      throw new ForbiddenException('Subscription not valid for college actions');
    }
    // Check limit
    if (subscription.plan.maxRequirements == null) {
      return; // unlimited
    }
    const usage = await this.getOrCreateUsage(subscription.id);
    if (usage.usedRequirements >= subscription.plan.maxRequirements) {
      throw new ForbiddenException('Requirement posting limit reached for current period');
    }
  }

  async incrementRequirementUsage(userId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) return;
    const usage = await this.getOrCreateUsage(subscription.id);
    await this.prisma.subscriptionusage.update({
      where: { id: usage.id },
      data: { usedRequirements: { increment: 1 } },
    });
  }

  async assertCollegeCanRevealContact(userId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }
    if (subscription.plan.audience !== 'COLLEGE') {
      throw new ForbiddenException('Subscription not valid for college actions');
    }
    if (subscription.plan.maxExpertContacts == null) {
      return; // unlimited
    }
    const usage = await this.getOrCreateUsage(subscription.id);
    if (usage.usedExpertContacts >= subscription.plan.maxExpertContacts) {
      throw new ForbiddenException('Expert contact view limit reached for current period');
    }
  }

  async incrementContactUsage(userId: string, expertId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) return;
    const usage = await this.getOrCreateUsage(subscription.id);
    
    // Get current revealed experts
    const currentUsage = await this.prisma.subscriptionusage.findUnique({
      where: { id: usage.id },
      select: { revealedExpertIds: true }
    });
    
    // Parse revealed expert IDs
    const revealedExpertIds = (currentUsage?.revealedExpertIds as string[]) || [];
    
    // Check if this expert has already been revealed
    if (revealedExpertIds.includes(expertId)) {
      // Expert already revealed, don't increment counter
      return;
    }
    
    // Add expert to revealed list and increment counter
    const updatedRevealedIds = [...revealedExpertIds, expertId];
    
    await this.prisma.subscriptionusage.update({
      where: { id: usage.id },
      data: { 
        usedExpertContacts: { increment: 1 },
        revealedExpertIds: updatedRevealedIds
      },
    });
  }

  async assertExpertCanApplyToJobs(userId: string) {
    // Fetch active subscription and plan
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }
    if (subscription.plan.audience !== 'EXPERT') {
      throw new ForbiddenException('Subscription not valid for expert actions');
    }
    // Check limit
    if (subscription.plan.maxRequirements == null) {
      return; // unlimited
    }
    const usage = await this.getOrCreateUsage(subscription.id);
    if (usage.usedRequirements >= subscription.plan.maxRequirements) {
      throw new ForbiddenException('Application limit reached for current period');
    }
  }

  async incrementExpertApplicationUsage(userId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) return;
    const usage = await this.getOrCreateUsage(subscription.id);
    await this.prisma.subscriptionusage.update({
      where: { id: usage.id },
      data: { usedRequirements: { increment: 1 } },
    });
  }

  async confirmPayment(userId: string, planId: string, paymentData: any, billingPeriod: string = 'MONTHLY') {
    try {
      console.log('Starting payment confirmation:', { userId, planId, paymentData });
      
      // Verify the plan exists and is active
      const plan = await this.prisma.subscriptionplan.findUnique({
        where: { id: planId, isActive: true }
      });
      
      console.log('Plan found:', plan);
      
      if (!plan) {
        throw new NotFoundException('Plan not found or inactive');
      }

      // For paid plans, verify payment with Cashfree using order_id
      if (plan.priceCents > 0) {
        const orderId =
          paymentData?.orderId ||
          paymentData?.order_id ||
          paymentData?.order?.id;
        if (!orderId) {
          throw new ForbiddenException('Missing Cashfree order_id');
        }

        const order = await this.cashfree.getOrder(orderId);
        const orderStatus: string | undefined = order?.order_status || order?.status;
        if (!orderStatus || !['PAID', 'SUCCESS'].includes(orderStatus.toUpperCase())) {
          throw new ForbiddenException('Payment not verified');
        }

        // Validate amount and currency
        const expectedPaise = this.calculateDynamicPrice(plan, billingPeriod);
        const orderAmountMajor = Number(order?.order_amount); // major units
        const orderCurrency = order?.order_currency || 'INR';
        if (orderCurrency !== (plan.currency || 'INR')) {
          throw new ForbiddenException('Currency mismatch');
        }
        if (Math.round(orderAmountMajor * 100) !== expectedPaise) {
          throw new ForbiddenException('Amount mismatch');
        }
      }

      // Calculate subscription end date based on selected billing period
      const now = new Date();
      let endsAt: Date;
      
      if (billingPeriod === 'MONTHLY') {
        endsAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      } else if (billingPeriod === 'QUARTERLY') {
        endsAt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      } else if (billingPeriod === 'SEMIANNUAL') {
        endsAt = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      } else if (billingPeriod === 'YEARLY') {
        endsAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      } else {
        endsAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()); // Default to monthly
      }

      // Cancel any existing active subscription
      await this.prisma.subscription.updateMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'CANCELED',
          updatedAt: new Date()
        }
      });

      // Create new subscription
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId,
          status: 'ACTIVE',
          startsAt: now,
          endsAt,
          createdAt: now,
          updatedAt: now
        },
        include: {
          plan: true,
          usages: {
            orderBy: { periodStart: 'desc' },
            take: 1,
          },
        }
      });

      console.log('Subscription created:', subscription);

      // Create or update payment record with dynamic pricing
      const dynamicPrice = this.calculateDynamicPrice(plan, billingPeriod);
      
      // Determine transactionId - prefer payment ID over order ID
      const transactionId =
        paymentData?.payment_id ||
        paymentData?.paymentId ||
        paymentData?.cf_payment_id ||
        paymentData?.razorpay_payment_id ||
        paymentData?.transactionId ||
        (paymentData?.orderId || paymentData?.order_id || null);

      // Check if payment with this transactionId already exists
      const existingPayment = transactionId
        ? await this.prisma.payment.findUnique({
            where: { transactionId },
          })
        : null;

      let payment;
      if (existingPayment) {
        // Update existing payment record
        console.log('Updating existing payment record:', existingPayment.id);
        payment = await this.prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            userId,
            amount: dynamicPrice / 100, // Convert from cents to rupees
            currency: plan.currency || 'INR',
            paymentMethod: 'DIGITAL_WALLET',
            status: 'COMPLETED',
            description: `Subscription payment for ${plan.name} plan (${billingPeriod})`,
            metadata: { ...paymentData, billingPeriod },
            updatedAt: now,
            completedAt: now,
          },
        });
        console.log('Payment record updated:', payment);
      } else {
        // Create new payment record
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        payment = await this.prisma.payment.create({
          data: {
            id: paymentId,
            userId,
            amount: dynamicPrice / 100, // Convert from cents to rupees
            currency: plan.currency || 'INR',
            paymentMethod: 'DIGITAL_WALLET',
            status: 'COMPLETED',
            transactionId,
            description: `Subscription payment for ${plan.name} plan (${billingPeriod})`,
            metadata: { ...paymentData, billingPeriod },
            createdAt: now,
            updatedAt: now,
            completedAt: now,
          },
        });
        console.log('Payment record created:', payment);
      }

      return subscription;
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Handle Prisma unique constraint errors specifically
      if (error?.code === 'P2002' && error?.meta?.target?.includes('transactionId')) {
        console.warn('Duplicate transactionId detected, attempting to update existing payment...');
        
        // Try to find and update existing payment
        const transactionId =
          paymentData?.payment_id ||
          paymentData?.paymentId ||
          paymentData?.cf_payment_id ||
          paymentData?.razorpay_payment_id ||
          paymentData?.transactionId ||
          (paymentData?.orderId || paymentData?.order_id || null);
        
        if (transactionId) {
          try {
            const existingPayment = await this.prisma.payment.findUnique({
              where: { transactionId },
            });
            
            if (existingPayment) {
              const plan = await this.prisma.subscriptionplan.findUnique({
                where: { id: planId, isActive: true }
              });
              
              if (plan) {
                const dynamicPrice = this.calculateDynamicPrice(plan, billingPeriod);
                const now = new Date();
                
                const updatedPayment = await this.prisma.payment.update({
                  where: { id: existingPayment.id },
                  data: {
                    userId,
                    amount: dynamicPrice / 100,
                    currency: plan.currency || 'INR',
                    paymentMethod: 'DIGITAL_WALLET',
                    status: 'COMPLETED',
                    description: `Subscription payment for ${plan.name} plan (${billingPeriod})`,
                    metadata: { ...paymentData, billingPeriod },
                    updatedAt: now,
                    completedAt: now,
                  },
                });
                
                console.log('Payment record updated after duplicate error:', updatedPayment);
                // Fetch the subscription that was already created (payment creation happens after subscription creation)
                const recoveredSubscription = await this.prisma.subscription.findFirst({
                  where: {
                    userId,
                    planId,
                    status: 'ACTIVE',
                  },
                  include: {
                    plan: true,
                    usages: {
                      orderBy: { periodStart: 'desc' },
                      take: 1,
                    },
                  },
                  orderBy: { createdAt: 'desc' },
                });
                
                if (recoveredSubscription) {
                  return recoveredSubscription;
                }
                // If subscription doesn't exist (shouldn't happen), re-throw original error
                throw new Error('Payment updated but subscription not found');
              }
            }
          } catch (recoveryError) {
            console.error('Failed to recover from duplicate transactionId error:', recoveryError);
          }
        }
      }
      
      throw error;
    }
  }

  // Create free trial subscription for new users
  async createFreeTrialSubscription(userId: string, audience: 'COLLEGE' | 'EXPERT') {
    // Check if user already has any subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { userId },
    });
    
    if (existingSubscription) {
      throw new ForbiddenException('User already has a subscription');
    }

    // Find the free plan for the audience
    const freePlan = await this.prisma.subscriptionplan.findFirst({
      where: {
        audience,
        planType: 'FREE',
        isActive: true,
      },
    });

    if (!freePlan) {
      throw new NotFoundException('Free plan not found for this audience');
    }

    // Create subscription with duration in days
    const now = new Date();
    const endsAt = new Date(now.getTime() + (freePlan.durationDays * 24 * 60 * 60 * 1000));

    return await this.prisma.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: 'ACTIVE',
        startsAt: now,
        endsAt,
      },
      include: {
        plan: true,
      },
    });
  }

  // Extend free plan for specific user (admin function)
  async extendFreePlan(userId: string, additionalDays: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        plan: { planType: 'FREE' },
      },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('No free subscription found for this user');
    }

    const currentEndDate = subscription.endsAt || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

    return await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { endsAt: newEndDate },
      include: { plan: true },
    });
  }

  // Get all users with their subscription status (admin function)
  async getAllUsersWithSubscriptions(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      include: {
        subscriptions: {
          include: {
            plan: true,
            usages: {
              orderBy: { periodStart: 'desc' },
              take: 1,
            },
          },
        },
        collegeprofile: true,
        expertprofile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count();

    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.collegeprofile?.institutionName || `${user.expertprofile?.jobTitle} at ${user.expertprofile?.company}` || 'N/A',
        subscription: user.subscriptions?.[0] ? {
          id: user.subscriptions[0].id,
          status: user.subscriptions[0].status,
          planType: user.subscriptions[0].plan.planType,
          planName: user.subscriptions[0].plan.name,
          startsAt: user.subscriptions[0].startsAt,
          endsAt: user.subscriptions[0].endsAt,
          usage: user.subscriptions[0].usages?.[0] || null,
        } : null,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}


