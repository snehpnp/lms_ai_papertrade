"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../utils/prisma");
const config_1 = require("../../config");
const errors_1 = require("../../utils/errors");
const COMMISSION_PERCENT_SUBADMIN = 20; // 20% to subadmin
exports.paymentService = {
    async createOrder(userId, courseId, provider, amount, currency) {
        const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            throw new errors_1.NotFoundError('Course not found');
        const payment = await prisma_1.prisma.payment.create({
            data: {
                userId,
                courseId,
                amount,
                currency: currency || 'INR',
                provider,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        if (provider === 'RAZORPAY' && config_1.config.razorpay.keyId) {
            const rzp = new razorpay_1.default({ key_id: config_1.config.razorpay.keyId, key_secret: config_1.config.razorpay.keySecret });
            const order = await rzp.orders.create({
                amount: Math.round(amount * 100), // paise
                currency: currency || 'INR',
                receipt: payment.id,
            });
            await prisma_1.prisma.payment.update({
                where: { id: payment.id },
                data: { providerOrderId: order.id },
            });
            return {
                paymentId: payment.id,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: config_1.config.razorpay.keyId,
            };
        }
        if (provider === 'STRIPE' && config_1.config.stripe.secretKey) {
            const stripe = new stripe_1.default(config_1.config.stripe.secretKey);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{ price_data: { currency: currency.toLowerCase(), unit_amount: Math.round(amount * 100), product_data: { name: course.title } }, quantity: 1 }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:4000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4000'}/payment/cancel`,
                metadata: { paymentId: payment.id },
            });
            await prisma_1.prisma.payment.update({
                where: { id: payment.id },
                data: { providerOrderId: session.id },
            });
            return {
                paymentId: payment.id,
                sessionId: session.id,
                url: session.url,
            };
        }
        throw new errors_1.BadRequestError('Payment provider not configured');
    },
    async verifyRazorpay(userId, paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const crypto = require('crypto');
        const sign = crypto.createHmac('sha256', config_1.config.razorpay.keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
        if (sign !== razorpaySignature)
            throw new errors_1.BadRequestError('Invalid signature');
        const payment = await prisma_1.prisma.payment.findFirst({ where: { id: paymentId, userId }, include: { course: true } });
        if (!payment || payment.providerOrderId !== razorpayOrderId)
            throw new errors_1.NotFoundError('Payment not found');
        await prisma_1.prisma.payment.update({
            where: { id: paymentId },
            data: { status: client_1.PaymentStatus.SUCCESS, providerPaymentId: razorpayPaymentId },
        });
        await this.assignCourseAndCommission(userId, payment.id, payment.courseId, Number(payment.amount));
        return { success: true, paymentId };
    },
    async verifyStripe(sessionId) {
        if (!config_1.config.stripe.secretKey)
            throw new errors_1.BadRequestError('Stripe not configured');
        const stripe = new stripe_1.default(config_1.config.stripe.secretKey);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paymentId = session.metadata?.paymentId;
        if (!paymentId || session.payment_status !== 'paid')
            throw new errors_1.BadRequestError('Invalid session');
        const payment = await prisma_1.prisma.payment.findUnique({ where: { id: paymentId }, include: { course: true } });
        if (!payment || !payment.courseId)
            throw new errors_1.NotFoundError('Payment not found');
        await prisma_1.prisma.payment.update({
            where: { id: paymentId },
            data: { status: client_1.PaymentStatus.SUCCESS, providerPaymentId: session.payment_intent || session.id },
        });
        await this.assignCourseAndCommission(payment.userId, payment.id, payment.courseId, Number(payment.amount));
        return { success: true, paymentId };
    },
    async assignCourseAndCommission(userId, paymentId, courseId, amount) {
        const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            return;
        await prisma_1.prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            create: { userId, courseId },
            update: {},
        });
        if (course.subadminId) {
            const commissionAmount = (amount * COMMISSION_PERCENT_SUBADMIN) / 100;
            await prisma_1.prisma.commission.create({
                data: {
                    userId: course.subadminId,
                    paymentId,
                    amount: commissionAmount,
                    percentage: COMMISSION_PERCENT_SUBADMIN,
                },
            });
        }
    },
    async getPaymentHistory(userId, role) {
        const where = role === 'ADMIN' ? {} : { userId };
        if (role === 'SUBADMIN') {
            where.course = { subadminId: userId };
        }
        const payments = await prisma_1.prisma.payment.findMany({
            where,
            include: { course: { select: { id: true, title: true } }, user: { select: { id: true, email: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return payments;
    },
};
//# sourceMappingURL=payment.service.js.map