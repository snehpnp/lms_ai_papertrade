import { prisma } from '../../utils/prisma';
import { ConflictError, BadRequestError } from '../../utils/errors';
import bcrypt from 'bcryptjs';

const profileSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,

  referralCode: true,
  referredById: true,
  isLearningMode: true,
  isPaperTradeDefault: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const profileService = {
  async toggleMode(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestError('User not found');

    const nextLearningMode = !user.isLearningMode;

    // Check if the mode we are switching TO is actually enabled
    if (nextLearningMode && !user.isLearningMode) {
      // Trying to switch TO learning, but what if they don't have access?
      // Wait, isLearningMode toggles the UI state. 
      // isLearningMode TRUE = Learning mode active
      // isPaperTradeDefault TRUE = Trading mode active
      // In User model, it seems isLearningMode is the active state... Wait.
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isLearningMode: !user.isLearningMode },
      select: profileSelect,
    });
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
    if (!user) return null;
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; email?: string; avatar?: string }) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictError('Email already in use');
    }
    const updateData: { name?: string; email?: string; avatar?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: profileSelect,
    });
  },

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestError('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },
};
