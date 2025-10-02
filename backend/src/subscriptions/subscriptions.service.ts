import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

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
        },
      },
    });
    
    console.log('Found subscription:', subscription);
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

  async confirmPayment(userId: string, planId: string, paymentData: any) {
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

      // Calculate subscription end date based on billing period
      const now = new Date();
      let endsAt: Date;
      
      if (plan.billingPeriod === 'MONTHLY') {
        endsAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      } else if (plan.billingPeriod === 'QUARTERLY') {
        endsAt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      } else if (plan.billingPeriod === 'YEARLY') {
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

      // Create payment record
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const payment = await this.prisma.payment.create({
        data: {
          id: paymentId,
          userId,
          amount: plan.priceCents / 100, // Convert from cents to dollars
          currency: plan.currency || 'INR',
          paymentMethod: 'DIGITAL_WALLET',
          status: 'COMPLETED',
          transactionId: paymentData.razorpay_payment_id || paymentData.payment_id,
          description: `Subscription payment for ${plan.name} plan`,
          metadata: paymentData,
          createdAt: now,
          updatedAt: now,
          completedAt: now
        }
      });

      console.log('Payment record created:', payment);

      return subscription;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}


