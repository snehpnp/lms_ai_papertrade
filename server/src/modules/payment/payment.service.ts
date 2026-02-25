import Razorpay from 'razorpay';
import Stripe from 'stripe';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { config } from '../../config';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { settingsService } from '../settings/settings.service';
import { logger } from '../../utils/activity-logger';

const COMMISSION_PERCENT_SUBADMIN = 20; // 20% to subadmin

export const paymentService = {
  async createOrder(userId: string, courseId: string, provider: 'RAZORPAY' | 'STRIPE', amount: number, currency: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course not found');

    const coursePrice = Number(course.price);
    if (coursePrice <= 0) throw new BadRequestError('This course is free');

    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: coursePrice,
        currency: currency || 'INR',
        provider,
        status: PaymentStatus.PENDING,
      },
    });

    if (provider === 'RAZORPAY') {
      try {
        const dbKeyId = await settingsService.getByKey('RAZORPAY_KEY_ID');
        const dbKeySecret = await settingsService.getByKey('RAZORPAY_KEY_SECRET');
        const keyId = dbKeyId || config.razorpay.keyId;
        const keySecret = dbKeySecret || config.razorpay.keySecret;


        if (!keyId || !keySecret) throw new BadRequestError('Razorpay not configured');

        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      
        const order = await rzp.orders.create({
          amount: Math.round(coursePrice * 100), // paise
          currency: currency || 'INR',
          receipt: payment.id,
        });
        await prisma.payment.update({
          where: { id: payment.id },
          data: { providerOrderId: order.id },
        });
        return {
          paymentId: payment.id,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: keyId,
        };
      } catch (error) {
      }
    }

    if (provider === 'STRIPE' && config.stripe.secretKey) {
      const stripe = new Stripe(config.stripe.secretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: currency.toLowerCase(), unit_amount: Math.round(amount * 100), product_data: { name: course.title } }, quantity: 1 }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL }/payment/cancel`,
        metadata: { paymentId: payment.id },
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerOrderId: session.id },
      });
      return {
        paymentId: payment.id,
        sessionId: session.id,
        url: session.url,
      };
    }

    throw new BadRequestError('Payment provider not configured');
  },

  async syncRazorpayMetadata(paymentId: string, razorpayPaymentId: string) {
    const dbKeyId = await settingsService.getByKey('RAZORPAY_KEY_ID');
    const dbKeySecret = await settingsService.getByKey('RAZORPAY_KEY_SECRET');
    const keyId = dbKeyId || config.razorpay.keyId;
    const keySecret = dbKeySecret || config.razorpay.keySecret;

    if (!keyId || !keySecret) return null;

    try {
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const rzpPayment: any = await rzp.payments.fetch(razorpayPaymentId);

      // Extract specific fields as requested
      const extractedMetadata = {
        method: rzpPayment.method,
        status: rzpPayment.status,
        email: rzpPayment.email,
        contact: rzpPayment.contact,
        amount: rzpPayment.amount / 100, // back to currency units
        bank: rzpPayment.bank || null,
        vpa: rzpPayment.vpa || null,
        wallet: rzpPayment.wallet || null,
        card: rzpPayment.card ? {
          network: rzpPayment.card.network,
          last4: rzpPayment.card.last4,
          type: rzpPayment.card.type,
          issuer: rzpPayment.card.issuer
        } : null,
        error_description: rzpPayment.error_description || null,
        // Store the full response inside a field for backup
        raw_response: rzpPayment
      };

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          metadata: extractedMetadata,
          providerPaymentId: razorpayPaymentId,
        }
      });

      return extractedMetadata;
    } catch (e) {
      console.error("Failed to sync Razorpay metadata for payment:", razorpayPaymentId, e);
      return null;
    }
  },

  async verifyRazorpay(userId: string, paymentId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const crypto = require('crypto');
    const dbKeySecret = await settingsService.getByKey('RAZORPAY_KEY_SECRET');
    const keySecret = dbKeySecret || config.razorpay.keySecret;

    if (!keySecret) throw new BadRequestError('Razorpay not configured');

    const sign = crypto.createHmac('sha256', keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    if (sign !== razorpaySignature) throw new BadRequestError('Invalid signature');

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { course: true }
    });

    if (!payment || payment.providerOrderId !== razorpayOrderId) {
      throw new NotFoundError('Payment not found');
    }

    // Update status to success first
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        providerPaymentId: razorpayPaymentId
      },
    });

    // Extract and sync enhanced metadata in background (or inline)
    await this.syncRazorpayMetadata(paymentId, razorpayPaymentId);

    // Assign course and handle commissions
    await this.assignCourseAndCommission(userId, payment.id, payment.courseId!, Number(payment.amount));

    return { success: true, paymentId };
  },

  async verifyStripe(sessionId: string) {
    if (!config.stripe.secretKey) throw new BadRequestError('Stripe not configured');
    const stripe = new Stripe(config.stripe.secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentId = session.metadata?.paymentId;
    if (!paymentId || session.payment_status !== 'paid') throw new BadRequestError('Invalid session');
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { course: true } });
    if (!payment || !payment.courseId) throw new NotFoundError('Payment not found');
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        providerPaymentId: (session.payment_intent as string) || session.id,
        metadata: {
          email: session.customer_details?.email,
          name: session.customer_details?.name,
          payment_status: session.payment_status
        }
      },
    });
    await this.assignCourseAndCommission(payment.userId, payment.id, payment.courseId, Number(payment.amount));
    return { success: true, paymentId };
  },

  async assignCourseAndCommission(userId: string, paymentId: string, courseId: string, amount: number) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return;
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    // Log activity
    await logger.log({
      userId,
      action: 'COURSE_ENROLLMENT',
      resource: 'Course',
      details: { courseId, courseTitle: course.title, paymentId }
    });

    if (course.subadminId) {
      const commissionAmount = (amount * COMMISSION_PERCENT_SUBADMIN) / 100;
      await prisma.commission.create({
        data: {
          userId: course.subadminId,
          paymentId,
          amount: commissionAmount,
          percentage: COMMISSION_PERCENT_SUBADMIN,
        },
      });
    }
  },

  async syncByProviderIds(razorpayOrderId: string, razorpayPaymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId: razorpayOrderId }
    });

    if (!payment) {
      throw new NotFoundError('Local payment record not found for this Order ID');
    }

    return await this.syncRazorpayMetadata(payment.id, razorpayPaymentId);
  },

  async handleRazorpayWebhook(payload: any, signature: string) {
    const crypto = require('crypto');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestError('Invalid webhook signature');
      }
    }

    const event = payload.event;
    if (event === 'payment.captured' || event === 'payment.authorized') {
      const rzpPayment = payload.payload.payment.entity;
      const razorpayOrderId = rzpPayment.order_id;
      const razorpayPaymentId = rzpPayment.id;

      // Find local record and sync
      await this.syncByProviderIds(razorpayOrderId, razorpayPaymentId);
    }

    return { received: true };
  },

  async getPaymentHistory(userId: string, role: string) {
    const where: any = role === 'ADMIN' ? {} : { userId };
    if (role === 'SUBADMIN') {
      where.course = { subadminId: userId };
    }
    const payments = await prisma.payment.findMany({
      where,
      include: { course: { select: { id: true, title: true } }, user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return payments;
  },
};
