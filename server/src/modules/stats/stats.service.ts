import { prisma } from '../../utils/prisma';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export const statsService = {
    async getAdminStats() {
        const [totalUsers, totalCourses, totalEnrollments, successfulPayments] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.course.count(),
            prisma.enrollment.count(),
            prisma.payment.findMany({
                where: { status: 'SUCCESS' },
                select: { amount: true },
            }),
        ]);

        const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalRevenue,
        };
    },

    async getRevenueChartData(days = 7) {
        const startDate = subDays(startOfDay(new Date()), days - 1);

        const payments = await prisma.payment.findMany({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: startDate },
            },
            select: {
                amount: true,
                createdAt: true,
            },
        });

        const chartData = [];
        for (let i = 0; i < days; i++) {
            const date = subDays(startOfDay(new Date()), i);
            const dayLabel = format(date, 'MMM dd');
            const dayRevenue = payments
                .filter(p => format(p.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                .reduce((sum, p) => sum + Number(p.amount), 0);

            chartData.unshift({
                name: dayLabel,
                revenue: dayRevenue,
            });
        }

        return chartData;
    },

    async getEnrollmentChartData(days = 7) {
        const startDate = subDays(startOfDay(new Date()), days - 1);

        const enrollments = await prisma.enrollment.findMany({
            where: {
                enrolledAt: { gte: startDate },
            },
            select: {
                enrolledAt: true,
            },
        });

        const chartData = [];
        for (let i = 0; i < days; i++) {
            const date = subDays(startOfDay(new Date()), i);
            const dayLabel = format(date, 'MMM dd');
            const count = enrollments
                .filter(e => format(e.enrolledAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                .length;

            chartData.unshift({
                name: dayLabel,
                count: count,
            });
        }

        return chartData;
    },

    async getRecentActivities(limit = 5) {
        return await prisma.activityLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });
    },

    async getTopCourses(limit = 4) {
        return await prisma.course.findMany({
            where: { isPublished: true },
            take: limit,
            include: {
                _count: {
                    select: { enrollments: true }
                },
                subadmin: {
                    select: { name: true }
                }
            },
            orderBy: {
                enrollments: { _count: 'desc' }
            }
        });
    },

    async getRecentTrades(limit = 4) {
        return await prisma.trade.findMany({
            take: limit,
            orderBy: { executedAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });
    },

    async getPaperTradeAnalytics(days = 7) {
        const startDate = subDays(startOfDay(new Date()), days - 1);

        const [totalTrades, totalPnlAgg, totalUsers, topSymbols, trades] = await Promise.all([
            prisma.trade.count(),
            prisma.trade.aggregate({
                _sum: { pnl: true }
            }),
            prisma.user.count({
                where: {
                    trades: { some: {} }
                }
            }),
            prisma.trade.groupBy({
                by: ['symbol'],
                _count: { id: true },
                orderBy: {
                    _count: { id: 'desc' }
                },
                take: 5
            }),
            prisma.trade.findMany({
                where: {
                    executedAt: { gte: startDate }
                },
                select: {
                    pnl: true,
                    executedAt: true,
                    quantity: true,
                    price: true
                }
            })
        ]);

        const totalRealizedPnl = Number(totalPnlAgg._sum.pnl || 0);

        const chartData = [];
        for (let i = 0; i < days; i++) {
            const date = subDays(startOfDay(new Date()), i);
            const dayLabel = format(date, 'MMM dd');
            const dayTrades = trades.filter(t => format(t.executedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
            
            const dayPnl = dayTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
            const dayCount = dayTrades.length;
            const dayVolume = dayTrades.reduce((sum, t) => sum + (Number(t.quantity) * Number(t.price)), 0);

            chartData.unshift({
                name: dayLabel,
                pnl: dayPnl,
                trades: dayCount,
                volume: dayVolume
            });
        }

        return {
            totalTrades,
            totalRealizedPnl,
            totalUsers,
            topSymbols: topSymbols.map(s => ({ symbol: s.symbol, count: s._count.id })),
            chartData
        };
    }
};
