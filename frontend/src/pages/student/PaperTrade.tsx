import { useState, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Eye, TrendingUp, TrendingDown, X,
  BarChart3, Clock, History, Star, StarOff, Wallet, ShieldCheck,
  Target, Percent, DollarSign, Activity, Zap, ListOrdered, Search,
  ChevronUp, ChevronDown, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
type OrderSide = "Buy" | "Sell";
type OrderType = "Market" | "Limit" | "Stop";


interface WatchlistItem {
  symbol: string;
  name: string;
  category: "Forex" | "Commodity" | "Crypto" | "Index" | "Stock";
  price: number;
  change: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  volume: string;
  starred: boolean;
}

interface OpenOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  lots: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
  time: string;
  sl: number;
  tp: number;
  margin: number;
  swap: number;
}

interface PendingOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: "Limit" | "Stop";
  lots: number;
  targetPrice: number;
  currentPrice: number;
  time: string;
  sl: number;
  tp: number;
}

interface HistoryOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  lots: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  openTime: string;
  closeTime: string;
  duration: string;
  status: "Win" | "Loss" | "Breakeven";
}

// ── Mock Data ──────────────────────────────────────────────
const initialWatchlist: WatchlistItem[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", category: "Forex", price: 1.0872, change: +0.15, bid: 1.0871, ask: 1.0873, high: 1.0895, low: 1.0842, volume: "1.2M", starred: true },
  { symbol: "GBP/USD", name: "British Pound / USD", category: "Forex", price: 1.2634, change: -0.08, bid: 1.2633, ask: 1.2635, high: 1.2680, low: 1.2601, volume: "890K", starred: true },
  { symbol: "USD/JPY", name: "US Dollar / Yen", category: "Forex", price: 149.52, change: +0.32, bid: 149.51, ask: 149.53, high: 149.88, low: 149.10, volume: "1.5M", starred: false },
  { symbol: "XAU/USD", name: "Gold Spot", category: "Commodity", price: 2024.50, change: +1.12, bid: 2024.30, ask: 2024.70, high: 2030.00, low: 2015.60, volume: "450K", starred: true },
  { symbol: "BTC/USD", name: "Bitcoin / USD", category: "Crypto", price: 43250.0, change: -0.45, bid: 43240.0, ask: 43260.0, high: 43800.0, low: 42900.0, volume: "2.1M", starred: false },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", category: "Forex", price: 0.8745, change: +0.05, bid: 0.8744, ask: 0.8746, high: 0.8760, low: 0.8720, volume: "320K", starred: false },
  { symbol: "AUD/USD", name: "Australian Dollar / USD", category: "Forex", price: 0.6578, change: -0.22, bid: 0.6577, ask: 0.6579, high: 0.6610, low: 0.6555, volume: "580K", starred: false },
  { symbol: "AAPL", name: "Apple Inc.", category: "Stock", price: 182.52, change: +1.35, bid: 182.50, ask: 182.54, high: 184.10, low: 180.90, volume: "52M", starred: true },
  { symbol: "TSLA", name: "Tesla Inc.", category: "Stock", price: 248.42, change: -2.10, bid: 248.38, ask: 248.46, high: 253.80, low: 246.50, volume: "98M", starred: false },
  { symbol: "SPX500", name: "S&P 500 Index", category: "Index", price: 4783.35, change: +0.48, bid: 4783.10, ask: 4783.60, high: 4795.00, low: 4770.20, volume: "3.4B", starred: true },
  { symbol: "NZD/USD", name: "New Zealand Dollar / USD", category: "Forex", price: 0.6132, change: +0.10, bid: 0.6131, ask: 0.6133, high: 0.6150, low: 0.6110, volume: "210K", starred: false },
  { symbol: "XAG/USD", name: "Silver Spot", category: "Commodity", price: 23.45, change: -0.38, bid: 23.43, ask: 23.47, high: 23.80, low: 23.20, volume: "180K", starred: false },
];

const initialOpenOrders: OpenOrder[] = [
  { id: "T001", symbol: "EUR/USD", side: "Buy", orderType: "Market", lots: 0.5, openPrice: 1.0855, currentPrice: 1.0872, pnl: +85.0, time: "2024-01-15 09:30", sl: 1.0820, tp: 1.0920, margin: 542.75, swap: -1.20 },
  { id: "T002", symbol: "XAU/USD", side: "Sell", orderType: "Market", lots: 0.1, openPrice: 2030.0, currentPrice: 2024.5, pnl: +55.0, time: "2024-01-15 10:15", sl: 2045.0, tp: 2010.0, margin: 2030.00, swap: -0.85 },
  { id: "T003", symbol: "GBP/USD", side: "Buy", orderType: "Market", lots: 1.0, openPrice: 1.2650, currentPrice: 1.2634, pnl: -160.0, time: "2024-01-15 11:00", sl: 1.2600, tp: 1.2720, margin: 1265.00, swap: -2.10 },
  { id: "T004", symbol: "AAPL", side: "Buy", orderType: "Market", lots: 10, openPrice: 180.25, currentPrice: 182.52, pnl: +227.0, time: "2024-01-15 14:30", sl: 175.00, tp: 190.00, margin: 1802.50, swap: 0 },
];

const initialPendingOrders: PendingOrder[] = [
  { id: "P001", symbol: "BTC/USD", side: "Buy", orderType: "Limit", lots: 0.01, targetPrice: 42000.0, currentPrice: 43250.0, time: "2024-01-15 08:00", sl: 41000.0, tp: 45000.0 },
  { id: "P002", symbol: "USD/JPY", side: "Sell", orderType: "Stop", lots: 0.3, targetPrice: 150.50, currentPrice: 149.52, time: "2024-01-15 09:00", sl: 151.50, tp: 148.00 },
];

const tradeHistory: HistoryOrder[] = [
  { id: "H001", symbol: "EUR/USD", side: "Buy", lots: 0.5, openPrice: 1.0820, closePrice: 1.0865, pnl: +225.0, openTime: "Jan 14, 08:00", closeTime: "Jan 14, 16:30", duration: "8h 30m", status: "Win" },
  { id: "H002", symbol: "USD/JPY", side: "Sell", lots: 0.3, openPrice: 150.20, closePrice: 149.80, pnl: +120.0, openTime: "Jan 14, 10:00", closeTime: "Jan 14, 14:00", duration: "4h", status: "Win" },
  { id: "H003", symbol: "GBP/USD", side: "Buy", lots: 1.0, openPrice: 1.2700, closePrice: 1.2660, pnl: -400.0, openTime: "Jan 13, 09:00", closeTime: "Jan 13, 17:00", duration: "8h", status: "Loss" },
  { id: "H004", symbol: "XAU/USD", side: "Buy", lots: 0.2, openPrice: 2010.0, closePrice: 2035.0, pnl: +500.0, openTime: "Jan 12, 11:00", closeTime: "Jan 12, 15:30", duration: "4h 30m", status: "Win" },
  { id: "H005", symbol: "BTC/USD", side: "Sell", lots: 0.01, openPrice: 44000.0, closePrice: 43500.0, pnl: +50.0, openTime: "Jan 11, 12:00", closeTime: "Jan 11, 18:00", duration: "6h", status: "Win" },
  { id: "H006", symbol: "AUD/USD", side: "Sell", lots: 0.5, openPrice: 0.6600, closePrice: 0.6630, pnl: -150.0, openTime: "Jan 10, 07:30", closeTime: "Jan 10, 12:00", duration: "4h 30m", status: "Loss" },
  { id: "H007", symbol: "AAPL", side: "Buy", lots: 5, openPrice: 178.50, closePrice: 178.50, pnl: 0, openTime: "Jan 09, 14:30", closeTime: "Jan 09, 16:00", duration: "1h 30m", status: "Breakeven" },
  { id: "H008", symbol: "TSLA", side: "Sell", lots: 3, openPrice: 252.00, closePrice: 248.80, pnl: +960.0, openTime: "Jan 08, 09:30", closeTime: "Jan 08, 15:00", duration: "5h 30m", status: "Win" },
];

// ── Component ──────────────────────────────────────────────
const PaperTrade = () => {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [openOrders, setOpenOrders] = useState(initialOpenOrders);
  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);
  const [selectedSymbol, setSelectedSymbol] = useState("EUR/USD");
  const [orderSide, setOrderSide] = useState<OrderSide>("Buy");
  const [orderType, setOrderType] = useState<OrderType>("Market");
  const [lots, setLots] = useState("0.10");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [watchlistFilter, setWatchlistFilter] = useState("All");
  const [watchlistSearch, setWatchlistSearch] = useState("");
  const [bottomTab, setBottomTab] = useState("open");

  // ── Calculations ─────────────────────────────────────────
  const startingBalance = 1_000_000;
  const totalPnl = openOrders.reduce((s, o) => s + o.pnl, 0);
  const totalSwap = openOrders.reduce((s, o) => s + o.swap, 0);
  const usedMargin = openOrders.reduce((s, o) => s + o.margin, 0);
  const equity = startingBalance + totalPnl + totalSwap;
  const freeMargin = equity - usedMargin;
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

  const historyStats = useMemo(() => {
    const wins = tradeHistory.filter((t) => t.status === "Win").length;
    const losses = tradeHistory.filter((t) => t.status === "Loss").length;
    const totalTrades = tradeHistory.length;
    const totalHistoryPnl = tradeHistory.reduce((s, t) => s + t.pnl, 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const avgWin = wins > 0 ? tradeHistory.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0;
    const avgLoss = losses > 0 ? tradeHistory.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0) / losses : 0;
    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;
    return { wins, losses, totalTrades, totalHistoryPnl, winRate, avgWin, avgLoss, profitFactor };
  }, []);

  // ── Watchlist filtering ──────────────────────────────────
  const filteredWatchlist = useMemo(() => {
    let list = watchlist;
    if (watchlistFilter === "Starred") list = list.filter((i) => i.starred);
    else if (watchlistFilter !== "All") list = list.filter((i) => i.category === watchlistFilter);
    if (watchlistSearch) list = list.filter((i) => i.symbol.toLowerCase().includes(watchlistSearch.toLowerCase()) || i.name.toLowerCase().includes(watchlistSearch.toLowerCase()));
    return list;
  }, [watchlist, watchlistFilter, watchlistSearch]);

  const toggleStar = (symbol: string) =>
    setWatchlist((w) => w.map((i) => (i.symbol === symbol ? { ...i, starred: !i.starred } : i)));

  const closeOrder = (id: string) =>
    setOpenOrders((o) => o.filter((t) => t.id !== id));

  const cancelPending = (id: string) =>
    setPendingOrders((o) => o.filter((t) => t.id !== id));

  const placeTrade = () => {
    const sym = watchlist.find((w) => w.symbol === selectedSymbol);
    if (!sym) return;
    const lotSize = parseFloat(lots) || 0.1;

    if (orderType !== "Market") {
      const target = parseFloat(limitPrice) || sym.price;
      const newPending: PendingOrder = {
        id: `P${Date.now().toString().slice(-4)}`,
        symbol: selectedSymbol,
        side: orderSide,
        orderType: orderType as "Limit" | "Stop",
        lots: lotSize,
        targetPrice: target,
        currentPrice: sym.price,
        time: new Date().toLocaleString(),
        sl: sl ? parseFloat(sl) : 0,
        tp: tp ? parseFloat(tp) : 0,
      };
      setPendingOrders((prev) => [newPending, ...prev]);
      setBottomTab("pending");
    } else {
      const newOrder: OpenOrder = {
        id: `T${Date.now().toString().slice(-4)}`,
        symbol: selectedSymbol,
        side: orderSide,
        orderType: "Market",
        lots: lotSize,
        openPrice: orderSide === "Buy" ? sym.ask : sym.bid,
        currentPrice: sym.price,
        pnl: 0,
        time: new Date().toLocaleString(),
        sl: sl ? parseFloat(sl) : 0,
        tp: tp ? parseFloat(tp) : 0,
        margin: sym.price * lotSize * 100,
        swap: 0,
      };
      setOpenOrders((prev) => [newOrder, ...prev]);
      setBottomTab("open");
    }
    setSl("");
    setTp("");
    setLimitPrice("");
  };

  const selectedSym = watchlist.find((w) => w.symbol === selectedSymbol);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Paper Trading"
        subtitle="Practice with $1,000,000 in virtual funds — risk-free trading simulation."
      />

      {/* ── Account Summary Strip ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Balance", value: `$${startingBalance.toLocaleString()}`, icon: Wallet, color: "text-primary" },
          { label: "Equity", value: `$${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: BarChart3, color: "text-primary" },
          { label: "Open P&L", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, icon: totalPnl >= 0 ? TrendingUp : TrendingDown, color: totalPnl >= 0 ? "text-profit" : "text-loss" },
          { label: "Used Margin", value: `$${usedMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: ShieldCheck, color: "text-muted-foreground" },
          { label: "Free Margin", value: `$${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-primary" },
          { label: "Margin Level", value: usedMargin > 0 ? `${marginLevel.toFixed(1)}%` : "∞", icon: Percent, color: marginLevel > 200 ? "text-profit" : marginLevel > 100 ? "text-yellow-500" : "text-loss" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className={cn("text-sm font-bold truncate", stat.color)}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Performance Stats ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Win Rate</span>
              <Target className="w-3.5 h-3.5 text-profit" />
            </div>
            <p className="text-xl font-bold text-foreground">{historyStats.winRate.toFixed(1)}%</p>
            <Progress value={historyStats.winRate} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{historyStats.wins}W / {historyStats.losses}L of {historyStats.totalTrades} trades</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total P&L</span>
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className={cn("text-xl font-bold", historyStats.totalHistoryPnl >= 0 ? "text-profit" : "text-loss")}>
              {historyStats.totalHistoryPnl >= 0 ? "+" : ""}${historyStats.totalHistoryPnl.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Across all closed trades</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Avg Win / Loss</span>
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
            </div>
            <div className="flex gap-2 items-baseline">
              <span className="text-sm font-bold text-profit">+${historyStats.avgWin.toFixed(0)}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-bold text-loss">${historyStats.avgLoss.toFixed(0)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Profit factor: {historyStats.profitFactor.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Open Positions</span>
              <ListOrdered className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{openOrders.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{pendingOrders.length} pending order{pendingOrders.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Trade Panel + Watchlist Grid ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Trade Execution Panel */}
        <Card className="border-border lg:col-span-4 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> New Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Symbol Select */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Instrument</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {watchlist.map((w) => (
                    <SelectItem key={w.symbol} value={w.symbol}>
                      <span className="font-semibold">{w.symbol}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{w.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Type Selector */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Order Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Market", "Limit", "Stop"] as OrderType[]).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={orderType === t ? "default" : "outline"}
                    className={cn("h-8 text-xs font-medium", orderType === t && "bg-primary text-primary-foreground")}
                    onClick={() => setOrderType(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={cn(
                  "h-12 font-bold text-sm border-2 transition-all",
                  orderSide === "Buy"
                    ? "bg-profit/10 border-profit text-profit hover:bg-profit/20"
                    : "border-border text-muted-foreground hover:border-profit hover:text-profit"
                )}
                onClick={() => setOrderSide("Buy")}
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                BUY
                {selectedSym && <span className="ml-1 text-xs font-mono">{selectedSym.ask}</span>}
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "h-12 font-bold text-sm border-2 transition-all",
                  orderSide === "Sell"
                    ? "bg-loss/10 border-loss text-loss hover:bg-loss/20"
                    : "border-border text-muted-foreground hover:border-loss hover:text-loss"
                )}
                onClick={() => setOrderSide("Sell")}
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                SELL
                {selectedSym && <span className="ml-1 text-xs font-mono">{selectedSym.bid}</span>}
              </Button>
            </div>

            {/* Price display */}
            {selectedSym && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-xs">
                <div>
                  <span className="text-muted-foreground">Spread: </span>
                  <span className="font-mono font-semibold">{((selectedSym.ask - selectedSym.bid) * (selectedSym.price > 100 ? 1 : 10000)).toFixed(1)} pts</span>
                </div>
                <div className={cn("font-semibold", selectedSym.change >= 0 ? "text-profit" : "text-loss")}>
                  {selectedSym.change >= 0 ? "+" : ""}{selectedSym.change}%
                </div>
              </div>
            )}

            {/* Limit/Stop Price */}
            {orderType !== "Market" && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                  {orderType} Price
                </label>
                <Input type="number" className="h-9" placeholder={selectedSym?.price.toString()} value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
              </div>
            )}

            {/* Volume */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Volume (Lots)</label>
              <div className="flex gap-1.5">
                <Input type="number" step="0.01" min="0.01" className="h-9" value={lots} onChange={(e) => setLots(e.target.value)} />
                {["0.01", "0.10", "0.50", "1.00"].map((v) => (
                  <Button key={v} size="sm" variant="outline" className={cn("h-9 px-2 text-[10px] font-mono shrink-0", lots === v && "border-primary text-primary")} onClick={() => setLots(v)}>
                    {v}
                  </Button>
                ))}
              </div>
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Stop Loss</label>
                <Input type="number" className="h-9" placeholder="—" value={sl} onChange={(e) => setSl(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Take Profit</label>
                <Input type="number" className="h-9" placeholder="—" value={tp} onChange={(e) => setTp(e.target.value)} />
              </div>
            </div>

            {/* Execute Button */}
            <Button
              className={cn(
                "w-full h-11 font-bold text-sm tracking-wide",
                orderSide === "Buy"
                  ? "bg-profit hover:bg-profit/90 text-white"
                  : "bg-loss hover:bg-loss/90 text-white"
              )}
              onClick={placeTrade}
            >
              {orderType !== "Market" ? `Place ${orderType} ` : ""}
              {orderSide === "Buy" ? "BUY" : "SELL"} {selectedSymbol}
            </Button>
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card className="border-border lg:col-span-8 xl:col-span-9">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Market Watch
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search symbol..."
                    className="h-8 pl-8 w-44 text-xs"
                    value={watchlistSearch}
                    onChange={(e) => setWatchlistSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-1">
                  {["All", "Starred", "Forex", "Stock", "Commodity", "Crypto", "Index"].map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={watchlistFilter === f ? "default" : "ghost"}
                      className={cn("h-7 px-2 text-[10px]", watchlistFilter === f && "bg-primary text-primary-foreground")}
                      onClick={() => setWatchlistFilter(f)}
                    >
                      {f === "Starred" ? <Star className="w-3 h-3" /> : f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-xs">Symbol</TableHead>
                    <TableHead className="text-xs text-right">Price</TableHead>
                    <TableHead className="text-xs text-right">Change</TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">Bid</TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">Ask</TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">High</TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">Low</TableHead>
                    <TableHead className="text-xs text-right hidden xl:table-cell">Volume</TableHead>
                    <TableHead className="text-xs text-right w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWatchlist.map((item) => (
                    <TableRow
                      key={item.symbol}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedSymbol === item.symbol ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedSymbol(item.symbol)}
                    >
                      <TableCell className="px-2">
                        <button onClick={(e) => { e.stopPropagation(); toggleStar(item.symbol); }}>
                          {item.starred
                            ? <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            : <StarOff className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-yellow-500" />
                          }
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold text-foreground text-sm">{item.symbol}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5 hidden sm:inline">{item.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-sm">{item.price}</TableCell>
                      <TableCell className={cn("text-right font-semibold text-xs", item.change >= 0 ? "text-profit" : "text-loss")}>
                        <span className="inline-flex items-center gap-0.5">
                          {item.change >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {Math.abs(item.change)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-loss hidden md:table-cell">{item.bid}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-profit hidden md:table-cell">{item.ask}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">{item.high}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">{item.low}</TableCell>
                      <TableCell className="text-right font-mono text-[10px] text-muted-foreground hidden xl:table-cell">{item.volume}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] font-bold text-profit hover:bg-profit/10"
                            onClick={(e) => { e.stopPropagation(); setSelectedSymbol(item.symbol); setOrderSide("Buy"); }}
                          >
                            B
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] font-bold text-loss hover:bg-loss/10"
                            onClick={(e) => { e.stopPropagation(); setSelectedSymbol(item.symbol); setOrderSide("Sell"); }}
                          >
                            S
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredWatchlist.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-sm">No symbols match your filter</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom: Open / Pending / History ───────────────── */}
      <Card className="border-border">
        <Tabs value={bottomTab} onValueChange={setBottomTab}>
          <CardHeader className="pb-0 flex-row items-center justify-between">
            <TabsList className="h-9">
              <TabsTrigger value="open" className="gap-1 text-xs h-7">
                <Activity className="w-3 h-3" /> Positions ({openOrders.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-1 text-xs h-7">
                <Clock className="w-3 h-3" /> Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 text-xs h-7">
                <History className="w-3 h-3" /> History ({tradeHistory.length})
              </TabsTrigger>
            </TabsList>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground">
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </CardHeader>

          <CardContent className="pt-3 p-0">
            {/* Open Positions */}
            <TabsContent value="open" className="mt-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["ID", "Symbol", "Side", "Type", "Volume", "Open Price", "Current", "S/L", "T/P", "Swap", "P&L", "Time", ""].map((h) => (
                        <TableHead key={h} className={cn("text-[10px] uppercase tracking-wider", ["P&L", "Open Price", "Current", "S/L", "T/P", "Swap", "Volume"].includes(h) && "text-right")}>
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={13} className="text-center py-10 text-muted-foreground">No open positions</TableCell></TableRow>
                    ) : (
                      openOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{order.id}</TableCell>
                          <TableCell className="font-semibold text-sm">{order.symbol}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[10px] font-bold border-0", order.side === "Buy" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss")}>
                              {order.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{order.orderType}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{order.lots}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{order.openPrice}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{order.currentPrice}</TableCell>
                          <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{order.sl || "—"}</TableCell>
                          <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{order.tp || "—"}</TableCell>
                          <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{order.swap.toFixed(2)}</TableCell>
                          <TableCell className={cn("text-right font-bold text-sm", order.pnl >= 0 ? "text-profit" : "text-loss")}>
                            {order.pnl >= 0 ? "+" : ""}${order.pnl.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{order.time}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-loss hover:text-loss hover:bg-loss/10" onClick={() => closeOrder(order.id)}>
                              <X className="w-3 h-3 mr-0.5" /> Close
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {openOrders.length > 0 && (
                      <TableRow className="bg-muted/30 font-semibold hover:bg-muted/30">
                        <TableCell colSpan={9} className="text-xs">Total</TableCell>
                        <TableCell className="text-right font-mono text-[10px]">{totalSwap.toFixed(2)}</TableCell>
                        <TableCell className={cn("text-right font-bold", totalPnl >= 0 ? "text-profit" : "text-loss")}>
                          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Pending Orders */}
            <TabsContent value="pending" className="mt-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["ID", "Symbol", "Side", "Type", "Volume", "Target Price", "Current", "S/L", "T/P", "Created", ""].map((h) => (
                        <TableHead key={h} className={cn("text-[10px] uppercase tracking-wider", ["Target Price", "Current", "S/L", "T/P", "Volume"].includes(h) && "text-right")}>
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={11} className="text-center py-10 text-muted-foreground">No pending orders</TableCell></TableRow>
                    ) : (
                      pendingOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{order.id}</TableCell>
                          <TableCell className="font-semibold text-sm">{order.symbol}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[10px] font-bold border-0", order.side === "Buy" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss")}>
                              {order.side}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{order.orderType}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">{order.lots}</TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold">{order.targetPrice}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{order.currentPrice}</TableCell>
                          <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{order.sl || "—"}</TableCell>
                          <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{order.tp || "—"}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{order.time}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-loss hover:text-loss hover:bg-loss/10" onClick={() => cancelPending(order.id)}>
                              <X className="w-3 h-3 mr-0.5" /> Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Trade History */}
            <TabsContent value="history" className="mt-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["ID", "Symbol", "Side", "Volume", "Open", "Close", "P&L", "Duration", "Open Time", "Close Time", "Result"].map((h) => (
                        <TableHead key={h} className={cn("text-[10px] uppercase tracking-wider", ["Open", "Close", "P&L", "Volume"].includes(h) && "text-right")}>
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-[10px] text-muted-foreground">{trade.id}</TableCell>
                        <TableCell className="font-semibold text-sm">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[10px] font-bold border-0", trade.side === "Buy" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss")}>
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{trade.lots}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{trade.openPrice}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{trade.closePrice}</TableCell>
                        <TableCell className={cn("text-right font-bold text-sm", trade.pnl > 0 ? "text-profit" : trade.pnl < 0 ? "text-loss" : "text-muted-foreground")}>
                          {trade.pnl > 0 ? "+" : ""}{trade.pnl === 0 ? "$0.00" : `$${trade.pnl.toFixed(2)}`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{trade.duration}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{trade.openTime}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{trade.closeTime}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px] border-0 font-bold",
                            trade.status === "Win" ? "bg-profit/15 text-profit" :
                            trade.status === "Loss" ? "bg-loss/15 text-loss" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {trade.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PaperTrade;
