import { Controller, Get, UseGuards, Req, Post, Body, Query, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CashfreeService } from '../services/cashfree.service';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { user_role } from '@prisma/client';

import { EmailService } from '../services/email.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly cashfree: CashfreeService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) { }

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

  // List active plans filtered by user's subscription history
  @Get(['plans/user', 'plans/for-user'])
  async listPlansForUser(@Req() req: any, @Query('audience') audience?: 'COLLEGE' | 'EXPERT') {
    const userId = req.user?.userId || req.user?.id;
    return this.subscriptionsService.listActivePlansForUser(userId, audience);
  }

  // Self-serve subscribe for authenticated user
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body('planId') planId: string) {
    const userId = req.user?.userId || req.user?.id;
    return this.subscriptionsService.createUserSubscription(userId, planId, true);
  }

  // Create Razorpay order for selected plan (client opens checkout with returned order)
  @Post('create-order')
  async createOrder(@Req() req: any, @Body() body: { planId: string; billingPeriod?: string }) {
    const { planId, billingPeriod = 'MONTHLY' } = body;
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
        }, billingPeriod);
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

    // For paid plans, create Cashfree order with dynamic pricing
    const shortPlan = String(planId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const shortUser = String(userId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const ts = Date.now().toString().slice(-8);
    const orderId = `p${shortPlan}_u${shortUser}_${ts}`.slice(0, 40);

    // Calculate dynamic price based on billing period
    const dynamicPrice = this.subscriptionsService.calculateDynamicPrice(plan, billingPeriod);

    // Fetch customer details for Cashfree
    const customer = await this.subscriptionsService['prisma'].user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, fullName: true, role: true },
    });

    // Determine dashboard route based on user role
    const userRole = customer?.role || req.user?.role;
    const dashboardRoute = userRole === 'EXPERT' ? 'expert' : 'college';

    // Construct return URL for payment callback
    // Cashfree requires HTTPS URLs, so we need to handle localhost/HTTP properly
    const frontendUrl = this.configService.get('CORS_ORIGIN') || this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    // For development with localhost, use HTTPS URL from env or skip return URL
    let returnUrl: string | undefined;
    if (frontendUrl.startsWith('http://localhost') || frontendUrl.startsWith('http://127.0.0.1')) {
      // In development, try to use a configured HTTPS URL (e.g., from ngrok or similar)
      const devHttpsUrl = this.configService.get('FRONTEND_HTTPS_URL');
      if (devHttpsUrl && devHttpsUrl.startsWith('https://')) {
        returnUrl = `${devHttpsUrl}/dashboard/${dashboardRoute}?tab=overview&payment_status=pending&order_id={order_id}`;
      } else if (isDevelopment) {
        // In development, we can skip return URL if Cashfree allows it
        // Otherwise, use a placeholder HTTPS URL (will need to be configured)
        console.warn('⚠️ Development mode: Using HTTP localhost URL. Cashfree requires HTTPS.');
        console.warn('⚠️ Set FRONTEND_HTTPS_URL environment variable for development (e.g., ngrok HTTPS URL)');
        // For now, skip return URL in development - Cashfree may allow this
        // If Cashfree requires it, uncomment the line below and configure FRONTEND_HTTPS_URL
        // returnUrl = undefined;
        // For testing, we'll use a placeholder that won't work but won't break the API call
        // In production, this should never happen
        returnUrl = undefined; // Skip return URL in development
      }
    } else {
      // For production or HTTPS URLs, ensure it's HTTPS
      if (frontendUrl.startsWith('https://')) {
        returnUrl = `${frontendUrl}/dashboard/${dashboardRoute}?tab=overview&payment_status=pending&order_id={order_id}`;
      } else {
        // Convert HTTP to HTTPS for production
        const httpsUrl = frontendUrl.replace('http://', 'https://');
        returnUrl = `${httpsUrl}/dashboard/${dashboardRoute}?tab=overview&payment_status=pending&order_id={order_id}`;
      }
    }

    // In production, return URL should always be set
    if (!isDevelopment && !returnUrl) {
      console.error('❌ CRITICAL: No return URL configured for production!');
      console.error('Set CORS_ORIGIN or FRONTEND_URL to your production HTTPS URL');
      throw new Error('Payment gateway configuration error: Missing frontend URL');
    }

    let cfOrder;
    try {
      const orderParams: any = {
        orderId,
        amountPaise: dynamicPrice,
        currency: plan.currency || 'INR',
        customer: {
          id: userId,
          email: customer?.email || undefined,
          phone: customer?.phone || undefined,
          name: customer?.fullName || undefined,
        },
        notes: { planId, billingPeriod },
      };

      // Only add returnUrl if it's defined (HTTPS URL)
      if (returnUrl) {
        orderParams.returnUrl = returnUrl;
      }

      cfOrder = await this.cashfree.createOrder(orderParams);

      // Store orderId -> planId mapping in Payment record for later lookup
      // This is a fallback in case Cashfree doesn't return notes in getOrder response
      try {
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.subscriptionsService['prisma'].payment.create({
          data: {
            id: paymentId,
            userId,
            amount: dynamicPrice / 100, // Convert from cents to rupees
            currency: plan.currency || 'INR',
            paymentMethod: 'DIGITAL_WALLET',
            status: 'PENDING',
            transactionId: orderId, // Store orderId as transactionId for lookup
            description: `Subscription payment for ${plan.name} plan (${billingPeriod}) - Order created`,
            metadata: {
              orderId,
              planId,
              billingPeriod,
              cashfreeOrderId: cfOrder?.order_id,
              paymentSessionId: cfOrder?.payment_session_id,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        console.log('✅ Payment record created for order lookup:', { orderId, planId });
      } catch (paymentError) {
        // Log but don't fail - this is just for lookup fallback
        console.warn('⚠️ Failed to create payment record for order lookup:', paymentError);
      }
    } catch (error) {
      console.error('Cashfree order creation failed:', error);
      return {
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Get payment_session_id from Cashfree response (don't modify it - use as-is)
    const paymentSessionId = cfOrder?.payment_session_id;

    // Only log if there's an obvious issue (don't clean unless absolutely necessary)
    if (paymentSessionId && (paymentSessionId.endsWith('paymentpayment') || paymentSessionId.endsWith('paymentpaymentpayment'))) {
      console.warn('⚠️ Payment session ID has duplicate suffix (should be cleaned on frontend):', {
        sessionId: paymentSessionId.substring(0, 50) + '...',
        length: paymentSessionId.length,
      });
    }

    let paymentLink = cfOrder?.payment_link || cfOrder?.payment_url;
    if (!paymentLink && paymentSessionId) {
      // Construct payment link manually as per Cashfree docs
      // Format: https://sandbox.cashfree.com/pg/payments/{payment_session_id}
      const baseUrl = this.cashfree.getSdkMode() === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
      paymentLink = `${baseUrl}/payments/${paymentSessionId}`;
    }

    // Log the response for debugging
    console.log('Cashfree order response summary:', {
      order_id: cfOrder?.order_id,
      order_status: cfOrder?.order_status,
      has_payment_session_id: !!paymentSessionId,
      has_payment_link: !!paymentLink,
      payment_session_id_length: paymentSessionId?.length,
      payment_session_id_preview: paymentSessionId ? paymentSessionId.substring(0, 50) + '...' : 'N/A',
      payment_session_id_full: paymentSessionId || 'MISSING', // Log full ID for debugging
      payment_link_preview: paymentLink ? paymentLink.substring(0, 80) + '...' : 'N/A',
      cashfree_payment_link: cfOrder?.payment_link ? cfOrder.payment_link.substring(0, 80) + '...' : 'N/A',
      cashfree_payment_url: cfOrder?.payment_url ? cfOrder.payment_url.substring(0, 80) + '...' : 'N/A',
      order_expiry_time: cfOrder?.order_expiry_time,
    });

    // Verify order is in a valid state for payment
    if (cfOrder?.order_status && !['ACTIVE', 'CREATED', 'PAYMENT_PENDING'].includes(cfOrder.order_status)) {
      console.warn('⚠️ Order status is not typical for new orders:', cfOrder.order_status);
    }

    // Validate payment_session_id before returning
    if (!paymentSessionId) {
      console.error('❌ CRITICAL: payment_session_id is missing from Cashfree response!');
      console.error('Full Cashfree response:', JSON.stringify(cfOrder, null, 2));
      throw new Error('Payment session ID not received from Cashfree. Please try again.');
    }

    if (!paymentSessionId.startsWith('session_')) {
      console.error('❌ CRITICAL: payment_session_id has invalid format!', {
        sessionId: paymentSessionId,
        length: paymentSessionId.length,
        firstChars: paymentSessionId.substring(0, 20),
      });
    }

    // Return data required by frontend Cashfree JS SDK
    return {
      paymentSessionId, // Return as-is from Cashfree (no modification)
      paymentLink, // Prefer Cashfree's payment_link if provided
      order: { id: cfOrder?.order_id, amount: dynamicPrice, currency: plan.currency || 'INR' },
      cashfreeMode: this.cashfree.getSdkMode(),
      billingPeriod,
      // Include order status for debugging
      orderStatus: cfOrder?.order_status,
      orderExpiryTime: cfOrder?.order_expiry_time,
    };
  }

  // Verify order status endpoint (for debugging and payment callbacks)
  @Post('verify-order')
  async verifyOrder(@Query('orderId') orderId: string) {
    if (!orderId) {
      return { error: 'Order ID is required' };
    }
    try {
      const order = await this.cashfree.getOrder(orderId);

      // Try to extract planId and billingPeriod from order notes first
      const notes = order.notes || {};
      let planId = notes.planId || null;
      let billingPeriod = notes.billingPeriod || 'MONTHLY';

      // Fallback: If notes don't have planId, look it up from Payment record
      if (!planId) {
        console.log('⚠️ PlanId not found in Cashfree order notes, looking up from Payment record...');
        try {
          // Try to find by our orderId (stored in transactionId)
          let payment = await this.subscriptionsService['prisma'].payment.findFirst({
            where: {
              transactionId: orderId,
              status: { in: ['PENDING', 'COMPLETED'] },
            },
            orderBy: { createdAt: 'desc' },
          });

          // If not found, try by Cashfree's order_id (stored in metadata)
          if (!payment && order.order_id) {
            const payments = await this.subscriptionsService['prisma'].payment.findMany({
              where: {
                status: { in: ['PENDING', 'COMPLETED'] },
              },
              orderBy: { createdAt: 'desc' },
              take: 100, // Limit search to recent payments
            });

            const foundPayment = payments.find(p => {
              const metadata = p.metadata as any;
              return metadata?.cashfreeOrderId === order.order_id || metadata?.orderId === orderId;
            });

            if (foundPayment) {
              payment = foundPayment;
            }
          }

          if (payment && payment.metadata) {
            const metadata = payment.metadata as any;
            planId = metadata.planId || null;
            billingPeriod = metadata.billingPeriod || 'MONTHLY';
            console.log('✅ Found planId from Payment record:', { planId, billingPeriod });
          } else {
            console.warn('⚠️ Payment record not found for orderId:', orderId, 'or Cashfree order_id:', order.order_id);
          }
        } catch (lookupError) {
          console.warn('⚠️ Error looking up Payment record:', lookupError);
        }
      } else {
        console.log('✅ Found planId in Cashfree order notes:', { planId, billingPeriod });
      }

      return {
        order_id: order.order_id,
        order_status: order.order_status,
        payment_session_id: order.payment_session_id,
        order_amount: order.order_amount,
        order_currency: order.order_currency,
        order_expiry_time: order.order_expiry_time,
        planId, // Include planId from notes or Payment record
        billingPeriod, // Include billingPeriod from notes or Payment record
      };
    } catch (error) {
      console.error('Order verification error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to verify order',
        orderId
      };
    }
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
  async confirmPayment(@Req() req: any, @Body() body: { planId: string; paymentData: any; billingPeriod?: string }) {
    const userId = req.user?.userId || req.user?.id;
    const { planId, paymentData, billingPeriod = 'MONTHLY' } = body;

    console.log('Payment confirmation request:', { userId, planId, paymentData });

    try {
      const subscription = await this.subscriptionsService.confirmPayment(userId, planId, paymentData, billingPeriod);
      console.log('Payment confirmed successfully:', subscription);
      return { success: true, subscription };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return { success: false, error: error.message };
    }
  }
}


