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
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Virtual Wallet"
                    subtitle="Manage your paper trading capital and analyze performance"
                />
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all",
                        connected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        <Activity className={cn("h-3 w-3", connected && "animate-pulse")} />
                        {connected ? "LIVE SESSION ACTIVE" : "SESSION DISCONNECTED"}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        className="h-10 px-4 rounded-xl border-primary/20 hover:bg-primary/5 transition-all text-xs font-bold gap-2"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
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

                        <CardHeader className="relative z-10 pt-8">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                    <Wallet className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Available Funds</span>
                            </div>
                            <CardTitle className="text-4xl font-black font-mono tracking-tight">
                                {formatCurrency(portfolio?.availableBalance || 0)}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-8 pb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Session P&L</p>
                                    <p className={cn(
                                        "text-sm font-mono font-bold",
                                        liveTodayPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                        {formatPnl(liveTodayPnl)}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Active Trades</p>
                                    <p className="text-sm font-mono font-bold">{positions.length}</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card border-border shadow-sm border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Net Worth</p>
                                    <PieChart className="h-4 w-4 text-primary opacity-50" />
                                </div>
                                <CardTitle className="text-2xl font-black font-mono">
                                    {formatCurrency(liveTotalEquity)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                    <span>Real-time Combined Value (Cash + Unrealized)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Blocked Margin</p>
                                    <Activity className="h-4 w-4 text-amber-500 opacity-50" />
                                </div>
                                <CardTitle className="text-2xl font-black font-mono text-amber-500">
                                    {formatCurrency(portfolio?.usedMargin || 0)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                    Capital currently tied in active trades
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Today's Total P&L</p>
                                        <p className={cn(
                                            "text-xl font-black font-mono",
                                            liveTodayPnl >= 0 ? "text-profit" : "text-loss"
                                        )}>
                                            {formatPnl(liveTodayPnl)}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "p-2 rounded-xl",
                                        liveTodayPnl >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                                    )}>
                                        {liveTodayPnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Unrealized Growth</p>
                                        <p className={cn(
                                            "text-xl font-black font-mono",
                                            liveUnrealizedPnl >= 0 ? "text-profit" : "text-loss"
                                        )}>
                                            {formatPnl(liveUnrealizedPnl)}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "p-2 rounded-xl text-blue-500 bg-blue-500/10"
                                    )}>
                                        <Target className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-muted/30 border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <History className="h-4 w-4 text-primary" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Trading Statistics</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium">Execution Success</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black font-mono text-primary">{winRate}%</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Win Rate</span>
                                </div>
                            </div>
                            <div className="space-y-2 lg:border-x border-border lg:px-8">
                                <p className="text-xs text-muted-foreground font-medium">Command Cycle</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black font-mono">{totalTrades}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Orders</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium">Profit Efficiency</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black font-mono text-emerald-500">{profitableTrades}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Wins</span>
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

