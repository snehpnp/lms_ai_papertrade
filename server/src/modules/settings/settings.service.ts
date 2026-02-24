import { prisma } from '../../utils/prisma';

export const settingsService = {
  async getAll() {
    return prisma.systemSettings.findMany();
  },

  async getByKey(key: string) {
    const setting = await prisma.systemSettings.findUnique({ where: { key } });
    return setting?.value;
  },

  async upsert(key: string, value: string, description?: string) {
    return prisma.systemSettings.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  },

  async bulkUpsert(settings: { key: string; value: string; description?: string }[]) {
    const promises = settings.map((s) =>
      prisma.systemSettings.upsert({
        where: { key: s.key },
        update: { value: s.value, description: s.description },
        create: { key: s.key, value: s.value, description: s.description },
      })
    );
    return Promise.all(promises);
  },
};
