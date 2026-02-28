import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity, Zap, RefreshCw, IndianRupee,
    TrendingUp, TrendingDown, ExternalLink, PieChart as PieIcon, LineChart as LineIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import tradeService, {
    type Order, type Position, type PortfolioSummary, type Trade
} from "@/services/trade.service";
import axiosInstance from "@/lib/axios";
import { useLivePrices } from "@/hooks/useLivePrice";
import { useProfileStore } from "@/store/profileStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,

    Cell,
    PieChart,
    Pie
} from "recharts";

const PaperTradeDashboard = () => {
    const { userProfile, fetchProfile } = useProfileStore();
    const { watchlists, activeWatchlistId, fetchWatchlists } = useWatchlistStore();
    const [positions, setPositions] = useState<Position[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setDataLoading(true);
            const [pos, ord, port, hist] = await Promise.all([
                tradeService.getOpenPositions(),
                tradeService.getOrders(),
                tradeService.getPortfolio(),
                tradeService.getTradeHistory({ limit: 50 }),
            ]);
            setPositions(pos || []);
            setOrders(ord?.items || []);
            setPortfolio(port);
            setTradeHistory(hist?.items || []);
        } catch (err) {
            console.error("Dashboard load failed:", err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        fetchProfile();
        fetchWatchlists();
    }, [loadData, fetchProfile, fetchWatchlists]);

    const activeWatchlist = useMemo(() => {
        return watchlists.find(w => w.id === activeWatchlistId);
    }, [watchlists, activeWatchlistId]);

    // Fetch exchange + token for live price of positions
    const [symbolTokenMap, setSymbolTokenMap] = useState<Record<string, { exchange: string; token: string }>>({});

    useEffect(() => {
        const fetchSymbolInfo = async () => {
            const map: Record<string, { exchange: string; token: string }> = {};
            for (const pos of positions) {
                if (!map[pos.symbol]) {
                    try {
                        const res: any = await axiosInstance.get("/symbols", { params: { q: pos.symbol, limit: 1 } });
                        const items = res?.data?.items || res?.items || [];
                        if (items.length > 0) {
                            map[pos.symbol] = { exchange: items[0].exchange, token: items[0].token };
                        }
                    } catch { /* ignore */ }
                }
            }
            setSymbolTokenMap(map);
        };
        if (positions.length > 0) fetchSymbolInfo();
    }, [positions]);

    // Consolidate all symbols for live price tracking
    const channels = useMemo(() => {
        const set = new Set<string>();
        const list: { exchange: string; token: string }[] = [];

        // Add watchlist items
        if (activeWatchlist) {
            activeWatchlist.items.forEach(item => {
                if (item.symbol?.exchange && item.symbol?.token) {
                    const key = `${item.symbol.exchange}|${item.symbol.token}`;
                    if (!set.has(key)) {
                        set.add(key);
                        list.push({ exchange: item.symbol.exchange, token: item.symbol.token });
                    }
                }
            });
        }

        // Add position items from positions
        Object.values(symbolTokenMap).forEach(s => {
            const key = `${s.exchange}|${s.token}`;
            if (!set.has(key)) {
                set.add(key);
                list.push({ exchange: s.exchange, token: s.token });
            }
        });

        return list;
    }, [activeWatchlist, symbolTokenMap]);

    const { prices: livePrices, connected } = useLivePrices(channels, channels.length > 0);

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // ── Analytical Data ───────────────────────────────────

    // 1. Equity Curve (Cumulative PNL)
    const equityCurve = useMemo(() => {
        if (!tradeHistory.length) return [];
        let cumulative = 0;
        const curve = tradeHistory
            .filter(t => t.pnl !== undefined)
            .reverse()
            .map(t => {
                cumulative += (t.pnl || 0);
                return {
                    name: new Date(t.executedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
                    pnl: cumulative
                };
            });
        return curve;
    }, [tradeHistory]);

    // 2. Side Distribution
    const sideDistribution = useMemo(() => {
        const buy = tradeHistory.filter(t => t.side === 'BUY').length;
        const sell = tradeHistory.filter(t => t.side === 'SELL').length;
        return [
            { name: 'BUY', value: buy, color: '#10b981' },
            { name: 'SELL', value: sell, color: '#f43f5e' }
        ];
    }, [tradeHistory]);

    // 3. Top Symbols by Profit
    const topSymbols = useMemo(() => {
        const stats: Record<string, number> = {};
        tradeHistory.forEach(t => {
            if (t.pnl) {
                stats[t.symbol] = (stats[t.symbol] || 0) + t.pnl;
            }
        });
        return Object.entries(stats)
            .map(([name, pnl]) => ({ name, pnl }))
            .sort((a, b) => b.pnl - a.pnl)
            .slice(0, 5);
    }, [tradeHistory]);

    const getLivePrice = useCallback((symbol: string): number | null => {
        const info = symbolTokenMap[symbol];
        if (!info) return null;
        const data = livePrices.get(`${info.exchange}|${info.token}`);
        return data?.lp ? parseFloat(data.lp) : null;
    }, [symbolTokenMap, livePrices]);

    const liveUnrealizedPnl = useMemo(() => {
        let sum = 0;
        positions.forEach(pos => {
            const ltp = getLivePrice(pos.symbol);
            if (ltp !== null) {
                const qty = Number(pos.quantity);
                const avg = Number(pos.avgPrice);
                const pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
                sum += pnl;
            } else {
                sum += pos.unrealizedPnl || 0;
            }
        });
        return sum;
    }, [positions, getLivePrice]);

    const liveTotalPnl = (portfolio?.totalPnl || 0) - (portfolio?.unrealizedPnl || 0) + liveUnrealizedPnl;
    const liveTotalEquity = (portfolio?.totalEquity || 0) - (portfolio?.unrealizedPnl || 0) + liveUnrealizedPnl;

    return (
        <div className="space-y-6 max-w-7xl mx-auto  md:p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Trading Hub"
                    subtitle="Virtual portfolio overview"
                />
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                    {userProfile?.referredBy?.brokerRedirectUrl && (
                        <a
                            href={userProfile.referredBy.brokerRedirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] md:text-[11px] font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-tighter"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Broker
                        </a>
                    )}
                    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-1.5 rounded-2xl border border-border shadow-sm">
                        <div className="px-3 border-r border-border/50">
                            <p className="text-[8px] md:text-[9px] uppercase font-black text-muted-foreground tracking-tighter">Balance</p>
                            <p className="text-xs md:text-sm font-black text-foreground">₹{(portfolio?.availableBalance || 0).toLocaleString()}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:bg-primary/10 rounded-xl" onClick={loadData}>
                            <RefreshCw className={cn("h-3.5 w-3.5", dataLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Net Equity Card */}
                <Card className="bg-slate-900 border-white/10 shadow-xl rounded-3xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Net Equity</p>
                                <p className="text-2xl font-black font-mono tracking-tighter text-white">
                                    ₹{liveTotalEquity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20 backdrop-blur-md">
                                <IndianRupee className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 relative z-10">
                            <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider leading-none">Global Assets</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Balance Card */}
                <Card className="bg-slate-900 border-white/10 shadow-xl rounded-3xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all" />
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Available Balance</p>
                                <p className="text-2xl font-black font-mono tracking-tighter text-blue-400">
                                    ₹{(portfolio?.availableBalance || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/20 backdrop-blur-md">
                                <Zap className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 relative z-10">
                            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider leading-none">Instant Liquidity</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Used Margin Card */}
                <Card className="bg-slate-900 border-white/10 shadow-xl rounded-3xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/30 transition-all" />
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Used Margin</p>
                                <p className="text-2xl font-black font-mono tracking-tighter text-amber-500">
                                    ₹{(portfolio?.usedMargin || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/20 backdrop-blur-md">
                                <Activity className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 relative z-10">
                            <Badge className="bg-amber-500/20 text-amber-500 border-none text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider leading-none">{((portfolio?.usedMargin || 0) / (liveTotalEquity || 1) * 100).toFixed(1)}% Utilization</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Today's P&L Card */}
                <Card className={cn(
                    "border-white/10 shadow-xl rounded-3xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]",
                    liveTotalPnl >= 0 ? "bg-emerald-950/40" : "bg-rose-950/40"
                )}>
                    <div className={cn(
                        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all",
                        liveTotalPnl >= 0 ? "bg-emerald-500/20 group-hover:bg-emerald-500/30" : "bg-rose-500/20 group-hover:bg-rose-500/30"
                    )} />
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Today's P&L</p>
                                <p className={cn("text-2xl font-black font-mono tracking-tighter", liveTotalPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                    {formatPnl(liveTotalPnl)}
                                </p>
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl border backdrop-blur-md",
                                liveTotalPnl >= 0 ? "bg-emerald-500/20 border-emerald-500/20" : "bg-rose-500/20 border-rose-500/20"
                            )}>
                                {liveTotalPnl >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-400" /> : <TrendingDown className="h-5 w-5 text-rose-400" />}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 relative z-10">
                            <Badge className={cn(
                                "border-none text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider leading-none",
                                liveTotalPnl >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                                {liveTotalPnl >= 0 ? "Trading Success" : "Market Correction"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Watchlist Quick View */}
                <Card className="border-border/40 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Watchlist
                        </CardTitle>
                        <Link to="/user/paper-trade/watchlist" className="text-[10px] font-bold text-primary hover:underline uppercase">View All</Link>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto no-scrollbar max-h-[360px]">
                        {!activeWatchlist?.items.length ? (
                            <div className="p-8 flex flex-col items-center justify-center opacity-30 text-center">
                                <Zap className="h-8 w-8 mb-2" />
                                <p className="text-[10px] font-bold uppercase">No Symbols Added</p>
                            </div>
                        ) : (
                            activeWatchlist.items.slice(0, 8).map(item => {
                                const sym = item.symbol;
                                const key = `${sym.exchange}|${sym.token}`;
                                const price = livePrices.get(key);
                                const ltp = price?.lp ? parseFloat(price.lp) : null;
                                const change = price?.pc ? parseFloat(price.pc) : null;
                                const isUp = (change ?? 0) >= 0;

                                return (
                                    <Link
                                        key={item.id}
                                        to="/user/paper-trade/watchlist"
                                        className="flex items-center justify-between px-4 py-3 border-b border-border/5 hover:bg-muted/30 transition-all group"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{sym.tradingSymbol}</p>
                                            <p className="text-[9px] font-semibold text-muted-foreground/50 tracking-wider uppercase mt-0.5">{sym.exchange}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-xs font-bold font-mono", isUp ? "text-emerald-500" : "text-rose-500")}>
                                                {ltp !== null ? ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                                            </p>
                                            <p className={cn("text-[9px] font-bold tabular-nums", isUp ? "text-emerald-500/80" : "text-rose-500/80")}>
                                                {change !== null ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "0.00%"}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Equity Curve Chart */}
                <Card className="lg:col-span-3 bg-card rounded-2xl border border-border/40 p-6 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <LineIcon className="h-4 w-4 text-primary" /> Equity Curve
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">Cumulative P&L</p>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={equityCurve}>
                                <defs>
                                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3989f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3989f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                    formatter={(value: number) => [`₹${value}`, 'Cumulative P&L']}
                                />
                                <Area type="monotone" dataKey="pnl" stroke="#3989f1" strokeWidth={3} fillOpacity={1} fill="url(#pnlGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="border-border/50 shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <PieIcon className="h-4 w-4 text-primary" /> Trade Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sideDistribution.some(d => d.value > 0) ? sideDistribution : [{ name: 'N/A', value: 1, color: '#e2e8f0' }]}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(sideDistribution.some(d => d.value > 0) ? sideDistribution : [{ name: 'N/A', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                                <span className="text-xl font-black text-foreground">{tradeHistory.length}</span>
                                <span className="text-[8px] text-muted-foreground uppercase font-black">Total Trades</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" /> Recent Orders
                        </CardTitle>
                        <Link to="/user/paper-trade/orders" className="text-[10px] text-primary font-black hover:underline uppercase">Full History</Link>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        {orders.slice(0, 5).length === 0 ? (
                            <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-muted/20 rounded-xl border border-dashed border-border">No orders yet</p>
                        ) : (
                            <div className="space-y-2.5">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-colors">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black uppercase tracking-tight">{order.symbol}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("h-3.5 text-[7px] font-black uppercase px-1 leading-none border-none", order.side === 'BUY' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>{order.side}</Badge>
                                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter">{order.orderType}</span>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-0.5">
                                            <p className="text-[11px] font-black font-mono">₹{order.price || 'MKT'}</p>
                                            <Badge className={cn("h-3.5 text-[7px] font-black uppercase px-1.5 leading-none", order.status === 'FILLED' ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600")}>{order.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className={cn("h-4 w-4", connected ? "text-green-500 animate-pulse" : "text-profit")} />
                            Top Positions {connected && <Badge variant="outline" className="ml-1 text-[8px] h-4 leading-none bg-green-500/10 text-green-500 border-green-500/20 px-1.5">LIVE</Badge>}
                        </CardTitle>
                        <Link to="/user/paper-trade/positions" className="text-[10px] text-primary font-black hover:underline uppercase">View All</Link>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        {positions.length === 0 ? (
                            <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-muted/20 rounded-xl border border-dashed border-border">No open positions</p>
                        ) : (
                            <div className="space-y-2.5">
                                {positions.slice(0, 5).map(pos => {
                                    const ltp = getLivePrice(pos.symbol);
                                    let pnl = pos.unrealizedPnl || 0;
                                    if (ltp !== null) {
                                        const qty = Number(pos.quantity);
                                        const avg = Number(pos.avgPrice);
                                        pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
                                    }
                                    return (
                                        <div key={pos.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-colors">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black uppercase tracking-tight">{pos.symbol}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn("h-3.5 text-[7px] font-black uppercase px-1 leading-none border-none", pos.side === 'BUY' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>{pos.side}</Badge>
                                                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter">{pos.quantity} Qty</span>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-0.5">
                                                <p className="text-[10px] font-black font-mono text-muted-foreground">
                                                    {ltp ? `₹${ltp.toLocaleString("en-IN", { minimumFractionDigits: 1 })}` : `Avg: ₹${pos.avgPrice}`}
                                                </p>
                                                <p className={cn("text-[11px] font-black font-mono leading-none", pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                    {formatPnl(pnl)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PaperTradeDashboard;
