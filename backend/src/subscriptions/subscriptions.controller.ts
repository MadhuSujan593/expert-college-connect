import { Controller, Get, UseGuards, Req, Post, Body, Query, NotFoundException } from '@nestjs/common';
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
    console.log('GET /subscriptions/me - User ID:', userId);
    const subscription = await this.subscriptionsService.getActiveSubscriptionForUser(userId);
    console.log('Returning subscription:', subscription);
    return subscription;
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
    
    // For free plans, skip Razorpay order creation and directly create subscription
    if (plan.priceCents === 0) {
      try {
        const subscription = await this.subscriptionsService.confirmPayment(userId, planId, {
          razorpay_payment_id: 'free_plan_' + Date.now(),
          razorpay_order_id: 'free_order_' + Date.now(),
          razorpay_signature: 'free_signature_' + Date.now()
        });
        return { 
          isFreePlan: true, 
          subscription,
          message: 'Free plan activated successfully' 
        };
      } catch (error) {
        console.error('Error activating free plan:', error);
        return { error: 'Failed to activate free plan' };
      }
    }
    
    // For paid plans, create Razorpay order
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
    
    // Check if user can reveal contact (plan validation + usage limits)
    await this.subscriptionsService.assertCollegeCanRevealContact(userId);
    
    // Increment usage counter (only if not already revealed)
    await this.subscriptionsService.incrementContactUsage(userId, expertId);
    
    // Get expert contact details
    const expertProfile = await this.subscriptionsService['prisma'].expertprofile.findUnique({
      where: { id: expertId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            fullName: true
          }
        }
      }
    });
    
    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }
    
    // Return contact details
    return { 
      success: true,
      contactDetails: {
        email: expertProfile.user.email,
        phone: expertProfile.user.phone,
        fullName: expertProfile.user.fullName
      }
    };
  }

  // Confirm payment and activate subscription
  @Post('confirm-payment')
  async confirmPayment(@Req() req: any, @Body() body: { planId: string; paymentData: any }) {
    const userId = req.user?.userId || req.user?.id;
    const { planId, paymentData } = body;
    
    console.log('Payment confirmation request:', { userId, planId, paymentData });
    
    try {
      const subscription = await this.subscriptionsService.confirmPayment(userId, planId, paymentData);
      console.log('Payment confirmed successfully:', subscription);
      return { success: true, subscription };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return { success: false, error: error.message };
    }
  }
}


