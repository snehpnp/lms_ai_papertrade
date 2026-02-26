// src/services/trade.service.ts
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────
export interface SymbolItem {
  id: number;
  token: string;
  symbol: string;
  tradingSymbol: string;
  exchange: string;
  instrument: string;
  lotSize?: number;
  tickSize?: number;
}

export interface SymbolSearchResult {
  items: SymbolItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  symbolId: string;
  symbol: SymbolItem;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  userId: string;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number | null;
  orderType: string;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  filledQty: number;
  createdAt: string;
  trades?: Trade[];
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  avgPrice: number;
  currentPrice?: number;
  unrealizedPnl?: number;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
}

export interface Trade {
  id: string;
  userId: string;
  orderId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  brokerage: number;
  pnl?: number;
  positionId?: string;
  executedAt: string;
}

export interface PnLSummary {
  totalPnl: number;
  totalBrokerage: number;
  netPnl: number;
}

export interface PortfolioSummary {
  walletBalance: number;
  availableBalance: number;
  usedMargin: number;
  totalOpenValue: number;
  totalEquity: number;
  unrealizedPnl: number;
  todayPnl: number;
  openPositionsCount: number;
  holdingsCount: number;
  positionsCount: number;
  totalPnl: number;
  totalBrokerage: number;
  netPnl: number;
}

export interface PlaceOrderPayload {
  symbolId?: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price?: number;
  orderType: "MARKET" | "LIMIT";
}

// ── Service ──────────────────────────────────────────────
const tradeService = {
  // Symbol search (public)
  async searchSymbols(params: {
    q?: string;
    exchange?: string;
    page?: number;
    limit?: number;
  }): Promise<SymbolSearchResult> {
    const res: any = await axiosInstance.get("/symbols", { params });
    return res.data;
  },

  async getSymbolById(id: number): Promise<SymbolItem> {
    const res: any = await axiosInstance.get(`/symbols/${id}`);
    return res.data;
  },

  // Place order
  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const res: any = await axiosInstance.post("/trades/orders", payload);
    return res.data;
  },

  // Close position
  async closePosition(
    positionId: string,
    closePrice: number
  ): Promise<{ message: string; pnl: number }> {
    const res: any = await axiosInstance.post(
      `/trades/positions/${positionId}/close`,
      { closePrice }
    );
    return res.data;
  },

  // Get today's positions
  async getTodayPositions(): Promise<Position[]> {
    const res: any = await axiosInstance.get("/trades/positions/today");
    return res.data;
  },

  // Get holdings
  async getHoldings(): Promise<Position[]> {
    const res: any = await axiosInstance.get("/trades/holdings");
    return res.data;
  },

  // Get open positions (all)
  async getOpenPositions(): Promise<Position[]> {
    const res: any = await axiosInstance.get("/trades/positions");
    return res.data;
  },


  // Get orders
  async getOrders(params?: {
    status?: string;
    symbol?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> {
    const res: any = await axiosInstance.get("/trades/orders", { params });
    return res.data;
  },

  // Get trade history
  async getTradeHistory(params?: {
    symbol?: string;
    side?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Trade>> {
    const res: any = await axiosInstance.get("/trades/history", { params });
    return res.data;
  },

  // PnL
  async getPnL(): Promise<PnLSummary> {
    const res: any = await axiosInstance.get("/trades/pnl");
    return res.data;
  },

  // Portfolio summary
  async getPortfolio(): Promise<PortfolioSummary> {
    const res: any = await axiosInstance.get("/trades/portfolio");
    return res.data;
  },

  // Wallet balance
  async getWalletBalance(): Promise<{ balance: number }> {
    const res: any = await axiosInstance.get("/wallet/me/balance");
    return res.data;
  },

  // Watchlists
  async getWatchlists(): Promise<Watchlist[]> {
    const res: any = await axiosInstance.get("/watchlists");
    return res.data;
  },

  async createWatchlist(name: string): Promise<Watchlist> {
    const res: any = await axiosInstance.post("/watchlists", { name });
    return res.data;
  },

  async updateWatchlist(id: string, name: string): Promise<Watchlist> {
    const res: any = await axiosInstance.put(`/watchlists/${id}`, { name });
    return res.data;
  },

  async deleteWatchlist(id: string): Promise<void> {
    await axiosInstance.delete(`/watchlists/${id}`);
  },

  async addSymbolToWatchlist(watchlistId: string, symbolId: string): Promise<WatchlistItem> {
    const res: any = await axiosInstance.post(`/watchlists/${watchlistId}/symbols`, { symbolId });
    return res.data;
  },

  async removeSymbolFromWatchlist(watchlistId: string, symbolId: string): Promise<void> {
    await axiosInstance.delete(`/watchlists/${watchlistId}/symbols/${symbolId}`);
  },

  async getHistory(params: {
    exchange: string;
    token: string;
    from: string;
    to: string;
    resolution?: string;
  }): Promise<any[]> {
    const res: any = await axiosInstance.get("/market/history", { params });
    return res.data.data;
  },
};

export default tradeService;
