import Razorpay from 'razorpay';
import Stripe from 'stripe';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { config } from '../../config';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { settingsService } from '../settings/settings.service';

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
    console.log("test", provider)

    if (provider === 'RAZORPAY') {
      try {
        const dbKeyId = await settingsService.getByKey('RAZORPAY_KEY_ID');
        const dbKeySecret = await settingsService.getByKey('RAZORPAY_KEY_SECRET');
        const keyId = dbKeyId || config.razorpay.keyId;
        const keySecret = dbKeySecret || config.razorpay.keySecret;


        if (!keyId || !keySecret) throw new BadRequestError('Razorpay not configured');

        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        console.log("coursePrice", rzp.orders)
        const order = await rzp.orders.create({
          amount: Math.round(coursePrice * 100), // paise
          currency: currency || 'INR',
          receipt: payment.id,
        });
        console.log("order", order)
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
        console.log("----", error)
      }
    }

    if (provider === 'STRIPE' && config.stripe.secretKey) {
      const stripe = new Stripe(config.stripe.secretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: currency.toLowerCase(), unit_amount: Math.round(amount * 100), product_data: { name: course.title } }, quantity: 1 }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:4000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4000'}/payment/cancel`,
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

  async verifyRazorpay(userId: string, paymentId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const crypto = require('crypto');
    const dbKeySecret = await settingsService.getByKey('RAZORPAY_KEY_SECRET');
    const keySecret = dbKeySecret || config.razorpay.keySecret;

    if (!keySecret) throw new BadRequestError('Razorpay not configured');

    const sign = crypto.createHmac('sha256', keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    if (sign !== razorpaySignature) throw new BadRequestError('Invalid signature');
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId }, include: { course: true } });
    if (!payment || payment.providerOrderId !== razorpayOrderId) throw new NotFoundError('Payment not found');
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.SUCCESS, providerPaymentId: razorpayPaymentId },
    });
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
      data: { status: PaymentStatus.SUCCESS, providerPaymentId: (session.payment_intent as string) || session.id },
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
