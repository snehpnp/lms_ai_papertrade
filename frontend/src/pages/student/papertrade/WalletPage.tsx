import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Wallet, RefreshCw, TrendingUp, TrendingDown,
    Activity, ArrowUpRight, ArrowDownRight,
    PieChart, History, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import tradeService, { type PortfolioSummary, type Position, type Trade } from "@/services/trade.service";
import { useLivePrices } from "@/hooks/useLivePrice";
import axiosInstance from "@/lib/axios";

const WalletPage = () => {
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [port, pos, hist] = await Promise.all([
                tradeService.getPortfolio(),
                tradeService.getOpenPositions(),
                tradeService.getTradeHistory(),
            ]);
            setPortfolio(port);
            setPositions(pos || []);
            setTradeHistory(hist?.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Live Price Logic ────────────────────────────────────
    const [symbolTokenMap, setSymbolTokenMap] = useState<Record<string, { exchange: string; token: string }>>({});

    useEffect(() => {
        const fetchSymbolInfo = async () => {
            const map: Record<string, { exchange: string; token: string }> = { ...symbolTokenMap };
            let changed = false;

            for (const pos of positions) {
                if (!map[pos.symbol]) {
                    try {
                        const res: any = await axiosInstance.get("/symbols", { params: { q: pos.symbol, limit: 1 } });
                        const items = res?.data?.items || res?.items || [];
                        if (items.length > 0) {
                            map[pos.symbol] = { exchange: items[0].exchange, token: items[0].token };
                            changed = true;
                        }
                    } catch { /* ignore */ }
                }
            }
            if (changed) setSymbolTokenMap(map);
        };
        if (positions.length > 0) fetchSymbolInfo();
    }, [positions]);

    const channels = useMemo(() => Object.values(symbolTokenMap).map(s => ({ exchange: s.exchange, token: s.token })), [symbolTokenMap]);
    const { prices: livePrices, connected } = useLivePrices(channels, channels.length > 0);

    const getLivePrice = (symbol: string): number | null => {
        const info = symbolTokenMap[symbol];
        if (!info) return null;
        const data = livePrices.get(`${info.exchange}|${info.token}`);
        return data?.lp ? parseFloat(data.lp) : null;
    };

    const liveUnrealizedPnl = useMemo(() => {
        return positions.reduce((acc, pos) => {
            const ltp = getLivePrice(pos.symbol);
            if (!ltp) return acc + (pos.unrealizedPnl || 0);
            const qty = Number(pos.quantity);
            const avg = Number(pos.avgPrice);
            const pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
            return acc + pnl;
        }, 0);
    }, [positions, livePrices, symbolTokenMap]);

    const liveTodayPnl = (portfolio?.todayPnl || 0) + liveUnrealizedPnl;
    const liveTotalEquity = (portfolio?.totalEquity || 0) - (portfolio?.unrealizedPnl || 0) + liveUnrealizedPnl;

    // ────────────────────────────────────────────────────────

    const formatCurrency = (val: number) => {
        return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "-";
        return `${prefix}₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const winRate = tradeHistory.length > 0
        ? ((tradeHistory.filter(t => (t.pnl || 0) > 0).length / tradeHistory.length) * 100).toFixed(1)
        : "0";

    const totalTrades = tradeHistory.length;
    const profitableTrades = tradeHistory.filter(t => (t.pnl || 0) > 0).length;

    return (
        <div className="space-y-8 max-w-7xl mx-auto md:p-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Virtual Wallet"
                    subtitle="Manage capital and analyze performance"
                />
                <div className="flex flex-wrap items-center gap-2">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold transition-all",
                        connected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        <Activity className={cn("h-3 w-3", connected && "animate-pulse")} />
                        {connected ? "LIVE" : "DISCONNECTED"}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        className="h-9 px-3 rounded-xl border-primary/20 hover:bg-primary/5 transition-all text-[10px] font-bold gap-1.5"
                    >
                        <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                        REFRESH
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Balance Card */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-slate-950 text-white border-white/10 shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none" />

                        <CardHeader className="relative z-10 pt-8 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-primary/20 rounded-xl border border-primary/20 backdrop-blur-md">
                                        <Wallet className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 leading-none">Capital Assets</span>
                                        <span className="text-[8px] font-bold text-primary/80 uppercase tracking-widest mt-1">Virtual Trading Portfolio</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-white/10 text-white/40 text-[7px] font-black uppercase tracking-widest bg-white/5">
                                    Available
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Settled Balance</p>
                                <CardTitle className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
                                    {formatCurrency(portfolio?.availableBalance || 0)}
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-6 md:space-y-8 pb-6 md:pb-8 pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Session P&L</p>
                                    <p className={cn(
                                        "text-xs md:text-sm font-mono font-bold",
                                        liveTodayPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                        {formatPnl(liveTodayPnl)}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Active Trades</p>
                                    <p className="text-xs md:text-sm font-mono font-bold">{positions.length}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/40 font-medium">Margin Utilization</span>
                                    <span className="font-mono font-bold">
                                        {portfolio?.totalEquity ? ((portfolio.usedMargin / portfolio.totalEquity) * 100).toFixed(1) : "0"}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                    <motion.div
                                        className="h-full bg-primary rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${portfolio?.totalEquity ? (portfolio.usedMargin / portfolio.totalEquity) * 100 : 0}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Performance Analytics */}
                <motion.div
                    className="lg:col-span-2 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-card border-border/50 shadow-sm border-l-4 border-l-primary rounded-2xl relative overflow-hidden group">
                            <CardHeader className="pb-2 p-5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Net Worth</p>
                                    <PieChart className="h-4 w-4 text-primary opacity-50" />
                                </div>
                                <CardTitle className="text-xl md:text-2xl font-black font-mono tracking-tighter">
                                    {formatCurrency(liveTotalEquity)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-tight">
                                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                    <span>Real-time Combined Value</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border/50 shadow-sm border-l-4 border-l-amber-500 rounded-2xl relative overflow-hidden group">
                            <CardHeader className="pb-2 p-5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Blocked Margin</p>
                                    <Activity className="h-4 w-4 text-amber-500 opacity-50" />
                                </div>
                                <CardTitle className="text-xl md:text-2xl font-black font-mono tracking-tighter text-amber-500">
                                    {formatCurrency(portfolio?.usedMargin || 0)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-tight">
                                    Capital tied in active trades
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Today's Total P&L</p>
                                        <p className={cn(
                                            "text-lg md:text-xl font-black font-mono tracking-tighter",
                                            liveTodayPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {formatPnl(liveTodayPnl)}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "p-2.5 rounded-xl",
                                        liveTodayPnl >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {liveTodayPnl >= 0 ? <TrendingUp className="h-4 w-4 md:h-5 md:w-5" /> : <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Unrealized Growth</p>
                                        <p className={cn(
                                            "text-lg md:text-xl font-black font-mono tracking-tighter",
                                            liveUnrealizedPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {formatPnl(liveUnrealizedPnl)}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "p-2.5 rounded-xl text-blue-500 bg-blue-500/10"
                                    )}>
                                        <Target className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <History className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Tactical Performance</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
                            <div className="space-y-2">
                                <p className="text-[10px] md:text-[11px] text-muted-foreground font-black uppercase tracking-widest">Exec. Success</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black font-mono text-primary tracking-tighter">{winRate}%</span>
                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Rate</span>
                                </div>
                            </div>
                            <div className="space-y-2 sm:border-x border-border/50 sm:px-12">
                                <p className="text-[10px] md:text-[11px] text-muted-foreground font-black uppercase tracking-widest">Command Cycle</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black font-mono tracking-tighter">{totalTrades}</span>
                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Orders</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] md:text-[11px] text-muted-foreground font-black uppercase tracking-widest">Profit Efficiency</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black font-mono text-emerald-500 tracking-tighter">{profitableTrades}</span>
                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Wins</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default WalletPage;

