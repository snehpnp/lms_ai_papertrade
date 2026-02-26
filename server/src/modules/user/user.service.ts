import { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { authService } from "../auth/auth.service";
import { generateReferralCode } from "../../utils/referral";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../utils/errors";
import { userEventEmitter, USER_EVENTS } from "./user.events";

const defaultUserSelect = {
  id: true,
  email: true,
  name: true,
  phoneNumber: true,
  role: true,
  isBlocked: true,
  brokerRedirectUrl: true,
  isPaperTradeDefault: true,
  isLearningMode: true,
  referralCode: true,
  referredById: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userService = {
  async create(data: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    referralCode?: string; // optional (referrer code)
    role: Role;
    createdById?: string;
    isPaperTradeDefault?: boolean;
    isLearningMode?: boolean;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictError("Email already registered");

    if (data.isLearningMode === false && data.isPaperTradeDefault === false) {
      throw new BadRequestError('User must have at least one mode accessible (Learning or Paper Trade)');
    }

    let referredById: string | null = null;

    // Explicit referral string takes precedence
    if (data.referralCode && data.role === "USER") {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });
      if (referrer) referredById = referrer.id;
    }
    // Fallback: If created from backend by SubAdmin or Admin, auto-assign to them
    else if (data.createdById && data.role === "USER") {
      const creator = await prisma.user.findUnique({ where: { id: data.createdById } });
      if (creator && (creator.role === "ADMIN" || creator.role === "SUBADMIN")) {
        referredById = creator.id;
      }
    }
    // Final default: Just pick any ADMIN.
    else if (data.role === "USER") {
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      if (adminUser) referredById = adminUser.id;
    }

    const referralCode = generateReferralCode();
    const passwordHash = await authService.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: data.role,
        referralCode,
        referredById,
        isPaperTradeDefault: data.isPaperTradeDefault ?? true,
        isLearningMode: data.isLearningMode ?? false,
      },
      select: defaultUserSelect,
    });

    if (referredById) {
      const referred = await prisma.user.findUnique({ where: { id: user.id } });

      if (referred)
        await prisma.referral.create({
          data: {
            referrerId: referredById,
            referredId: referred.id,
            code: referred?.referralCode!,
          },
        });
    }

    // Create wallet for USER
    if (data.role === "USER") {
      await prisma.wallet.create({
        data: { userId: user.id, balance: 0 },
      });
    }

    return user;
  },

  async findAll(params: {
    role?: Role;
    search?: string;
    page?: number;
    limit?: number;
    subadminId?: string; // when subadmin: only referred users
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (params.role) where.role = params.role;
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: "insensitive" } },
        { name: { contains: params.search, mode: "insensitive" } },
        { phoneNumber: { contains: params.search, mode: "insensitive" } },
        { referralCode: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.subadminId) {
      where.referredById = params.subadminId;
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...defaultUserSelect,
          referredBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedItems = items.map((item) => {
      const { referredBy, ...rest } = item;
      return {
        ...rest,
        referrerName: referredBy?.name || "None",
      };
    });

    return { items: formattedItems, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string, options?: { forSubadmin?: string }) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...defaultUserSelect,
        wallet: true,
        _count: {
          select: {
            enrollments: true,
            trades: true,
            positions: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundError("User not found");
    if (options?.forSubadmin && user.referredById !== options.forSubadmin)
      throw new NotFoundError("User not found");
    return user;
  },

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
      phoneNumber?: string;
      brokerRedirectUrl?: string;
      isPaperTradeDefault?: boolean;
      isLearningMode?: boolean;
    },
    options?: { forSubadmin?: string }
  ) {
    const existingUser = await this.findById(id, options);

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) throw new ConflictError('Email already in use');
    }

    if (data.phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: { phoneNumber: data.phoneNumber, NOT: { id } },
      });
      if (existingPhone) throw new ConflictError('Phone already in use');
    }

    if (data.isLearningMode !== undefined || data.isPaperTradeDefault !== undefined) {
      const finalLearning = data.isLearningMode ?? existingUser.isLearningMode;
      const finalTrade = data.isPaperTradeDefault ?? existingUser.isPaperTradeDefault;
      if (!finalLearning && !finalTrade) {
        throw new BadRequestError('User must have at least one mode accessible (Learning or Paper Trade)');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.brokerRedirectUrl !== undefined) updateData.brokerRedirectUrl = data.brokerRedirectUrl;
    if (data.isPaperTradeDefault !== undefined) updateData.isPaperTradeDefault = data.isPaperTradeDefault;
    if (data.isLearningMode !== undefined) updateData.isLearningMode = data.isLearningMode;
    if (data.password)
      updateData.passwordHash = await authService.hashPassword(data.password);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: defaultUserSelect,
    });

    // Broadcast updates to the specific user stream
    userEventEmitter.emit(USER_EVENTS.USER_UPDATED, id, updatedUser);

    return updatedUser;
  },

  async delete(id: string, options?: { forSubadmin?: string }) {
    await this.findById(id, options);
    await prisma.user.delete({ where: { id } });
    return { message: "User deleted" };
  },

  async block(id: string, options?: { forSubadmin?: string }) {
    await this.findById(id, options);
    const blockedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: true },
      select: defaultUserSelect,
    });

    userEventEmitter.emit(USER_EVENTS.USER_BLOCKED, id);

    // Invalidating user tokens (log out all current sessions)
    await authService.logoutAll(id);

    return blockedUser;
  },

  async unblock(id: string, options?: { forSubadmin?: string }) {
    await this.findById(id, options);
    return prisma.user.update({
      where: { id },
      data: { isBlocked: false },
      select: defaultUserSelect,
    });
  },

  async getActivityReport(userId: string, options?: { forSubadmin?: string }) {
    await this.findById(userId, options);
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return { userId, logs };
  },

  async getTradingReport(userId: string, options?: { forSubadmin?: string }) {
    await this.findById(userId, options);
    const [trades, positions, wallet] = await Promise.all([
      prisma.trade.findMany({
        where: { userId },
        orderBy: { executedAt: "desc" },
        take: 500,
      }),
      prisma.position.findMany({
        where: { userId },
        orderBy: { openedAt: "desc" },
      }),
      prisma.wallet.findUnique({ where: { userId } }),
    ]);

    const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
    const winningTrades = trades.filter((t) => Number(t.pnl ?? 0) > 0).length;

    return {
      userId,
      totalTrades: trades.length,
      winningTrades,
      winRate: trades.length ? (winningTrades / trades.length) * 100 : 0,
      totalPnl,
      walletBalance: wallet ? Number(wallet.balance) : 0,
      trades,
      positions,
    };
  },

  async getCourseProgress(userId: string, options?: { forSubadmin?: string }) {
    await this.findById(userId, options);
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        progress: {
          include: { lesson: { select: { id: true, title: true } } },
        },
        certificate: true,
      },
    });

    const result = enrollments.map((e) => {
      const totalLessons = e.course ? 0 : 0; // would need course.modules.lessons count
      const completed = e.progress.length;
      return {
        courseId: e.course?.id,
        courseTitle: e.course?.title,
        enrolledAt: e.enrolledAt,
        completedLessons: completed,
        completedAt: e.completedAt,
        certificate: e.certificate,
      };
    });

    const courseIds = enrollments.map((e) => e.courseId);
    const lessonCounts = await prisma.lesson.count({
      where: { module: { courseId: { in: courseIds } } },
    });
    // Simplified: return per-enrollment progress
    return { enrollments: result, userId };
  },
};
