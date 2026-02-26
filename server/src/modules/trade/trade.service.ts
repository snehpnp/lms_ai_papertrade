import { OrderSide, OrderStatus, PositionStatus } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { walletService } from '../wallet/wallet.service';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { Decimal } from '@prisma/client/runtime/library';
import { aliceBlueWS } from '../market/aliceblue.ws';

function toDecimal(n: number): Decimal {
  return new Decimal(n);
}

export const tradeService = {
  async getBrokerageCharge(amount: number): Promise<number> {
    return 0; // Hardcoded to 0 as per user request to remove brokerage
  },

  async validateSymbol(symbol: string): Promise<void> {
    const upperSymbol = symbol.toUpperCase();

    // Check MarketConfig first (whitelist)
    const config = await prisma.marketConfig.findFirst({
      where: { symbol: upperSymbol, isActive: true },
    });
    if (config) return;

    // Fallback: Check Alice Blue Symbol table
    const symbolInfo = await prisma.symbol.findFirst({
      where: { tradingSymbol: upperSymbol },
    });

    if (!symbolInfo) {
      throw new BadRequestError(`Symbol ${symbol} is not available for trading`);
    }
  },

  /** Fetch live price from Alice Blue for a given symbol */
  async fetchLivePrice(symbolId?: string, tradingSymbol?: string): Promise<number> {
    // Look up exchange + token from Symbol table
    let symbolInfo;
    if (symbolId) {
      symbolInfo = await prisma.symbol.findUnique({ where: { id: symbolId } });
    }
    if (!symbolInfo && tradingSymbol) {
      symbolInfo = await prisma.symbol.findFirst({
        where: { tradingSymbol: tradingSymbol.toUpperCase() },
      });
    }

    if (!symbolInfo) return 0;

    // Check cached price first
    const cached = aliceBlueWS.getLatestPrice(symbolInfo.exchange, symbolInfo.token);
    if (cached?.lp) return parseFloat(cached.lp);

    // Try to connect and subscribe
    try {
      const connected = await aliceBlueWS.connect();
      if (!connected) return 0;

      // Wait for price (max 8 seconds)
      return new Promise<number>((resolve) => {
        const timeout = setTimeout(() => resolve(0), 8000);
        aliceBlueWS.subscribe(symbolInfo!.exchange, symbolInfo!.token, (data) => {
          clearTimeout(timeout);
          resolve(data.lp ? parseFloat(data.lp) : 0);
        });
      });
    } catch {
      return 0;
    }
  },

  async placeOrder(
    userId: string,
    data: { symbolId?: string; symbol?: string; side: OrderSide; quantity: number; price?: number; orderType: string }
  ) {
    let symbol = data.symbol?.toUpperCase();

    if (data.symbolId) {
      const symbolInfo = await prisma.symbol.findUnique({
        where: { id: data.symbolId },
      });
      if (symbolInfo) {
        symbol = symbolInfo.tradingSymbol.toUpperCase();
      }
    }

    if (!symbol) throw new BadRequestError('Symbol or Symbol ID is required');

    await this.validateSymbol(symbol);
    const qty = data.quantity;
    if (qty <= 0) throw new BadRequestError('Quantity must be positive');

    // For MARKET orders: auto-fetch live price from Alice Blue if not provided
    let price = data.price ?? 0;
    if (data.orderType === 'MARKET' && price <= 0) {
      price = await this.fetchLivePrice(data.symbolId, symbol);
      if (price <= 0) {
        throw new BadRequestError('Could not fetch live market price. Please try again or use a LIMIT order.');
      }
    }

    const totalCost = qty * price;
    const wallet = await walletService.getOrCreateWallet(userId);
    if (Number(wallet.balance) < totalCost) {
      throw new BadRequestError(`Insufficient balance. Required: ₹${totalCost.toLocaleString()}, Available: ₹${Number(wallet.balance).toLocaleString()}`);
    }

    const order = await prisma.order.create({
      data: {
        userId,
        symbol,
        side: data.side,
        quantity: qty,
        price: price > 0 ? toDecimal(price) : null,
        orderType: data.orderType,
        status: OrderStatus.PENDING,
        filledQty: 0,
      },
    });

    // Immediate fill for MARKET
    if (data.orderType === 'MARKET' && price > 0) {
      await this.executeMarketOrder(order.id, userId, symbol, data.side, qty, price, 0, wallet.id);
    }

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { trades: true },
    });
    return updated!;
  },

  async executeMarketOrder(
    orderId: string,
    userId: string,
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number,
    brokerage: number,
    walletId: string
  ) {
    await prisma.$transaction(async (tx) => {
      const totalCost = quantity * price;
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet || Number(wallet.balance) < totalCost) {
        throw new BadRequestError('Insufficient funds for trade execution');
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: Number(wallet.balance) - totalCost },
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          type: 'DEBIT',
          amount: -totalCost,
          balanceAfter: Number(wallet.balance) - totalCost,
          reference: orderId,
          description: `Funds locked for ${symbol} ${side}`,
        },
      });

      let positionId: string | null = null;
      const existingPosition = await tx.position.findFirst({
        where: { userId, symbol, side, status: PositionStatus.OPEN },
      });

      if (existingPosition) {
        positionId = existingPosition.id;
        const newQty = Number(existingPosition.quantity) + quantity;
        const newAvg =
          (Number(existingPosition.avgPrice) * Number(existingPosition.quantity) + price * quantity) /
          newQty;
        await tx.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: toDecimal(newQty),
            avgPrice: toDecimal(newAvg),
          },
        });
      } else {
        const pos = await tx.position.create({
          data: {
            userId,
            symbol,
            side,
            quantity,
            avgPrice: price,
            status: PositionStatus.OPEN,
          },
        });
        positionId = pos.id;
      }

      const trade = await tx.trade.create({
        data: {
          userId,
          orderId,
          symbol,
          side,
          quantity,
          price,
          brokerage,
          positionId,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.FILLED, filledQty: quantity },
      });
    }, { timeout: 15000 });
  },

  async closePosition(userId: string, positionId: string, closePrice: number) {
    const position = await prisma.position.findFirst({
      where: { id: positionId, userId, status: PositionStatus.OPEN },
    });
    if (!position) throw new NotFoundError('Open position not found');

    const qty = Number(position.quantity);
    const avgPrice = Number(position.avgPrice);
    const pnl = position.side === 'BUY' ? (closePrice - avgPrice) * qty : (avgPrice - closePrice) * qty;
    const brokerage = 0;

    const wallet = await walletService.getOrCreateWallet(userId);

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          symbol: position.symbol,
          side: position.side === 'BUY' ? 'SELL' : 'BUY',
          quantity: qty,
          price: closePrice,
          orderType: 'MARKET',
          status: OrderStatus.FILLED,
          filledQty: qty,
        },
      });

      const trade = await tx.trade.create({
        data: {
          userId,
          orderId: order.id,
          symbol: position.symbol,
          side: position.side === 'BUY' ? 'SELL' : 'BUY',
          quantity: qty,
          price: closePrice,
          brokerage,
          pnl,
          positionId: position.id,
        },
      });

      await tx.position.update({
        where: { id: positionId },
        data: {
          status: PositionStatus.CLOSED,
          closedAt: new Date(),
          quantity: 0,
          currentPrice: closePrice,
          unrealizedPnl: pnl,
        },
      });

      const lockedFunds = qty * avgPrice;
      const refundAmount = lockedFunds + pnl;
      const updatedWallet = await tx.wallet.findUnique({ where: { userId } });
      const newBal = Number(updatedWallet!.balance) + refundAmount;

      await tx.wallet.update({
        where: { id: updatedWallet!.id },
        data: { balance: newBal },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet!.id,
          type: 'CREDIT',
          amount: refundAmount,
          balanceAfter: newBal,
          reference: trade.id,
          description: `Position closed: ${position.symbol}. P&L: ₹${pnl.toFixed(2)}`,
        },
      });
    }, { timeout: 15000 });

    return { message: 'Position closed', pnl };
  },

  async getOpenPositions(userId: string) {
    const positions = await prisma.position.findMany({
      where: { userId, status: PositionStatus.OPEN },
      orderBy: { openedAt: 'desc' },
    });
    return positions;
  },

  async getTodayPositions(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.position.findMany({
      where: {
        userId,
        status: PositionStatus.OPEN,
        openedAt: { gte: today },
      },
      orderBy: { openedAt: 'desc' },
    });
  },

  async getHoldings(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.position.findMany({
      where: {
        userId,
        status: PositionStatus.OPEN,
        openedAt: { lt: today },
      },
      orderBy: { openedAt: 'desc' },
    });
  },

  async getOrders(userId: string, params?: { status?: OrderStatus; symbol?: string; page?: string | number; limit?: string | number }) {
    const where: any = { userId };
    if (params?.status) where.status = params.status;
    if (params?.symbol) {
      where.symbol = { contains: params.symbol, mode: 'insensitive' };
    }

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { trades: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getTradeHistory(userId: string, params?: { symbol?: string; side?: string; page?: string | number; limit?: string | number }) {
    const where: any = { userId };
    if (params?.symbol) {
      where.symbol = { contains: params.symbol, mode: 'insensitive' };
    }
    if (params?.side) where.side = params.side;

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.trade.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getPnL(userId: string) {
    const trades = await prisma.trade.findMany({
      where: { userId, pnl: { not: null } },
    });
    const totalPnl = trades.reduce((s, t) => s + Number(t.pnl ?? 0), 0);
    const totalBrokerage = trades.reduce((s, t) => s + Number(t.brokerage), 0);
    return { totalPnl, totalBrokerage, netPnl: totalPnl - totalBrokerage };
  },

  async getPortfolioSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [allOpenPositions, pnl, wallet, todayClosedTrades] = await Promise.all([
      prisma.position.findMany({ where: { userId, status: PositionStatus.OPEN } }),
      this.getPnL(userId),
      walletService.getOrCreateWallet(userId),
      prisma.trade.findMany({
        where: {
          userId,
          pnl: { not: null },
          executedAt: { gte: today }
        }
      })
    ]);

    const usedMargin = allOpenPositions.reduce(
      (s, p) => s + Number(p.quantity) * Number(p.avgPrice),
      0
    );

    const unrealizedPnlBase = allOpenPositions.reduce(
      (s, p) => s + Number(p.unrealizedPnl || 0),
      0
    );

    // Identify which ones are today's and which ones are holdings
    const todayPositions = allOpenPositions.filter(p => p.openedAt >= today);
    const holdings = allOpenPositions.filter(p => p.openedAt < today);

    // Today's P&L = Unrealized P&L of today's open positions + Realized P&L of trades closed today
    const realizedTodayPnl = todayClosedTrades.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const unrealizedTodayPnl = todayPositions.reduce((s, p) => s + Number(p.unrealizedPnl || 0), 0);
    const todayPnl = realizedTodayPnl + unrealizedTodayPnl;

    const availableBalance = Number(wallet.balance);
    const totalEquity = availableBalance + usedMargin + unrealizedPnlBase;

    return {
      availableBalance,
      walletBalance: availableBalance,
      usedMargin,
      totalOpenValue: usedMargin,
      totalEquity,
      unrealizedPnl: unrealizedPnlBase,
      todayPnl,
      totalPnl: pnl.totalPnl,
      openPositionsCount: allOpenPositions.length,
      holdingsCount: holdings.length,
      positionsCount: todayPositions.length,
      ...pnl,
    };
  },

  // Admin: all trades, all positions, leaderboard
  async adminGetAllTrades(params: { userId?: string; symbol?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, params.limit ?? 50);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.symbol) where.symbol = params.symbol;
    const [items, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.trade.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async adminGetAllPositions(params: { userId?: string; status?: PositionStatus }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.status) where.status = params.status;
    return prisma.position.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      take: 500,
      include: { user: { select: { name: true, email: true } } }
    });
  },

  async getLeaderboard(params: {
    sortBy: 'net_profit_pct' | 'win_rate' | 'consistency';
    limit?: number;
  }) {
    const limit = Math.min(100, params.limit ?? 20);
    const trades = await prisma.trade.findMany({
      where: { pnl: { not: null } },
      select: { userId: true, pnl: true },
    });
    const byUser = new Map<
      string,
      { totalPnl: number; wins: number; total: number; trades: number[] }
    >();
    for (const t of trades) {
      const pnl = Number(t.pnl!);
      let r = byUser.get(t.userId);
      if (!r) r = { totalPnl: 0, wins: 0, total: 0, trades: [] };
      r.totalPnl += pnl;
      r.total++;
      if (pnl > 0) r.wins++;
      r.trades.push(pnl);
      byUser.set(t.userId, r);
    }
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(byUser.keys()) }, role: 'USER' },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    let rows = Array.from(byUser.entries()).map(([userId, r]) => {
      const winRate = r.total > 0 ? (r.wins / r.total) * 100 : 0;
      const avgPnl = r.trades.length ? r.trades.reduce((a, b) => a + b, 0) / r.trades.length : 0;
      const variance =
        r.trades.length > 1
          ? r.trades.reduce((s, p) => s + Math.pow(p - avgPnl, 2), 0) / (r.trades.length - 1)
          : 0;
      const consistency = variance > 0 ? 100 - Math.min(100, Math.sqrt(variance) * 10) : 100;
      return {
        userId,
        name: userMap.get(userId)?.name,
        email: userMap.get(userId)?.email,
        totalPnl: r.totalPnl,
        netProfitPct: 0, // would need initial capital
        winRate,
        tradeCount: r.total,
        consistency,
      };
    });
    if (params.sortBy === 'net_profit_pct' || params.sortBy === 'win_rate')
      rows.sort((a, b) => b.totalPnl - a.totalPnl);
    if (params.sortBy === 'win_rate') rows.sort((a, b) => b.winRate - a.winRate);
    if (params.sortBy === 'consistency') rows.sort((a, b) => b.consistency - a.consistency);
    return rows.slice(0, limit);
  },
};
