import { Controller, Get, UseGuards, Req, Post, Body, Query } from '@nestjs/common';
import { RazorpayService } from '../services/razorpay.service';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { user_role } from '@prisma/client';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly razorpay: RazorpayService,
  ) {}

  @Get('me')
  async getMySubscription(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.subscriptionsService.getActiveSubscriptionForUser(userId);
  }

  // Public for authenticated users: list active plans (optionally by audience)
  @Get('plans')
  async listPlans(@Query('audience') audience?: 'COLLEGE' | 'EXPERT') {
    return this.subscriptionsService.listActivePlans(audience);
  }

  // Self-serve subscribe for authenticated user
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body('planId') planId: string) {
    const userId = req.user?.userId || req.user?.id;
    return this.subscriptionsService.createUserSubscription(userId, planId, true);
  }

  // Create Razorpay order for selected plan (client opens checkout with returned order)
  @Post('create-order')
  async createOrder(@Req() req: any, @Body('planId') planId: string) {
    const userId = req.user?.userId || req.user?.id;
    const plan = await this.subscriptionsService['prisma'].subscriptionplan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return { error: 'Invalid plan' };
    }
    // Razorpay receipt must be <= 40 chars. Use compact, deterministic value.
    const shortPlan = String(planId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const shortUser = String(userId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const ts = Date.now().toString().slice(-8);
    const receipt = `p${shortPlan}_u${shortUser}_${ts}`.slice(0, 40);
    const order = await this.razorpay.createOrder(plan.priceCents, plan.currency || 'INR', receipt);
    return { order, keyId: process.env.RAZORPAY_KEY_ID };
  }

  // Reveal contact (college-only) and consume quota
  @Post('reveal-contact')
  @Roles(user_role.COLLEGE_ADMIN)
  async revealContact(@Req() req: any, @Body('expertId') expertId: string) {
    const userId = req.user?.userId || req.user?.id;
    await this.subscriptionsService.assertCollegeCanRevealContact(userId);
    // In a full impl, fetch and return expert contact info securely
    await this.subscriptionsService.incrementContactUsage(userId);
    return { success: true };
  }
}


