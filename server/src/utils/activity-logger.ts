import { prisma } from './prisma';

export const logger = {
    async log(params: {
        userId: string;
        action: string;
        resource?: string;
        details?: any;
        ip?: string;
        userAgent?: string;
    }) {
        try {
            await prisma.activityLog.create({
                data: {
                    userId: params.userId,
                    action: params.action,
                    resource: params.resource,
                    details: params.details || {},
                    ip: params.ip,
                    userAgent: params.userAgent,
                },
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    },
};
