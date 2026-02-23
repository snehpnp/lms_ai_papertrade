import { prisma } from '../../utils/prisma';
import { ConflictError } from '../../utils/errors';

const profileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  
  referralCode: true,
  referredById: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const profileService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
    if (!user) return null;
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictError('Email already in use');
    }
    const updateData: { name?: string; email?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: profileSelect,
    });
  },
};
