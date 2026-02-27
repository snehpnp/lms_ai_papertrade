import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2, TrendingUp, TrendingDown, Activity,
    Search, ChevronLeft, ChevronRight,
    Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService, { type Position, type PortfolioSummary } from "@/services/trade.service";
import { useLivePrices } from "@/hooks/useLivePrice";
import axiosInstance from "@/lib/axios";

const PositionsPage = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [holdings, setHoldings] = useState<Position[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [closingId, setClosingId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [posData, holdingsData, portfolioData] = await Promise.all([
                tradeService.getTodayPositions(),
                tradeService.getHoldings(),
                tradeService.getPortfolio()
            ]);
            setPositions(posData || []);
            setHoldings(holdingsData || []);
            setPortfolio(portfolioData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load trading data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Fetch exchange + token for live price for all items
    const [symbolTokenMap, setSymbolTokenMap] = useState<Record<string, { exchange: string; token: string }>>({});

    useEffect(() => {
        const fetchSymbolInfo = async () => {
            const map: Record<string, { exchange: string; token: string }> = { ...symbolTokenMap };
            const allItems = [...positions, ...holdings];
            let changed = false;

            for (const pos of allItems) {
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
        if (positions.length > 0 || holdings.length > 0) fetchSymbolInfo();
    }, [positions, holdings]);

    const channels = useMemo(() => Object.values(symbolTokenMap).map(s => ({ exchange: s.exchange, token: s.token })), [symbolTokenMap]);
    const { prices: livePrices, connected } = useLivePrices(channels, channels.length > 0);

    const getLivePrice = (symbol: string): number | null => {
        const info = symbolTokenMap[symbol];
        if (!info) return null;
        const data = livePrices.get(`${info.exchange}|${info.token}`);
        return data?.lp ? parseFloat(data.lp) : null;
    };

    const getLiveChange = (symbol: string): number | null => {
        const info = symbolTokenMap[symbol];
        if (!info) return null;
        const data = livePrices.get(`${info.exchange}|${info.token}`);
        return data?.pc ? parseFloat(data.pc) : null;
    };

    const handleClose = async (id: string, symbol: string) => {
        const ltp = getLivePrice(symbol);
        if (!ltp) { toast.error("Live price not available yet. Please wait."); return; }
        try {
            setClosingId(id);
            await tradeService.closePosition(id, ltp);
            toast.success(`Position closed at ₹${ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
            loadData();
        } catch { toast.error("Failed to close position"); }
        finally { setClosingId(null); }
    };

    const fmt = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtPnl = (val: number) => `${val >= 0 ? "+" : ""}₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Live P&L Calculations
    const liveTodayUnrealized = useMemo(() => {
        return positions.reduce((acc, pos) => {
            const ltp = getLivePrice(pos.symbol);
            if (!ltp) return acc;
            const qty = Number(pos.quantity);
            const avg = Number(pos.avgPrice);
            const pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
            return acc + pnl;
        }, 0);
    }, [positions, livePrices, symbolTokenMap]);

    const liveHoldingsUnrealized = useMemo(() => {
        return holdings.reduce((acc, pos) => {
            const ltp = getLivePrice(pos.symbol);
            if (!ltp) return acc;
            const qty = Number(pos.quantity);
            const avg = Number(pos.avgPrice);
            const pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
            return acc + pnl;
        }, 0);
    }, [holdings, livePrices, symbolTokenMap]);

    const totalTodayPnl = (portfolio?.todayPnl || 0) + liveTodayUnrealized;
    const totalUnrealizedPnl = liveTodayUnrealized + liveHoldingsUnrealized;

    const renderTable = (items: Position[], type: 'position' | 'holding') => {
        const filtered = search.trim()
            ? items.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()))
            : items;

        const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return (
            <div className="space-y-4">
                {/* Mobile View - Card based */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                    {paginated.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed border-border">
                            No {type === 'position' ? 'open positions' : 'holdings'} found.
                        </div>
                    ) : (
                        paginated.map((pos) => {
                            const ltp = getLivePrice(pos.symbol);
                            const change = getLiveChange(pos.symbol);
                            const isUp = (change ?? 0) >= 0;

                            let pnl = pos.unrealizedPnl || 0;
                            if (ltp) {
                                const qty = Number(pos.quantity);
                                const avg = Number(pos.avgPrice);
                                pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
                            }

                            return (
                                <div key={pos.id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all active:bg-muted/5">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-muted/10 rounded-full -mr-10 -mt-10 pointer-events-none" />

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm uppercase tracking-tight antialiased">{pos.symbol}</span>
                                                <Badge className={cn(
                                                    "text-[7px] font-black px-1.5 py-0 h-3.5 uppercase tracking-tighter border-none",
                                                    pos.side === 'BUY' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                                                )}>
                                                    {pos.side}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter border-r border-border/50 pr-2">
                                                    Qty: <span className="text-foreground">{pos.quantity}</span>
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                                    Avg: <span className="text-foreground">₹{Number(pos.avgPrice).toFixed(1)}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "px-2.5 py-1 rounded-lg font-black text-xs font-mono tracking-tighter shadow-sm",
                                                pnl >= 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                            )}>
                                                {fmtPnl(pnl)}
                                            </div>
                                            <p className="text-[7px] text-muted-foreground uppercase font-black tracking-widest mt-1">Total P&L</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-t border-border/40 relative z-10">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black px-1">Live Market Price</p>
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-xs font-black font-mono tracking-tighter">{ltp ? fmt(ltp) : "—"}</span>
                                                {change !== null && (
                                                    <span className={cn("text-[8px] font-black flex items-center gap-0.5", isUp ? "text-emerald-500" : "text-rose-500")}>
                                                        {isUp ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                                                        {change.toFixed(2)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 px-4 text-[9px] font-black tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 rounded-xl transition-all active:scale-95 uppercase"
                                            onClick={() => handleClose(pos.id, pos.symbol)}
                                            disabled={closingId === pos.id || ltp === null}
                                        >
                                            {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Close"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop View - Table based */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider font-bold text-muted-foreground w-12">#</th>
                                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Symbol</th>
                                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider font-bold text-muted-foreground w-16">Side</th>
                                <th className="py-3 px-4 text-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Qty</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Avg Price</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-bold text-muted-foreground">LTP</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-bold text-muted-foreground">P&L</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-20 text-muted-foreground italic">
                                        No {type === 'position' ? 'open positions' : 'holdings'} found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((pos, i) => {
                                    const ltp = getLivePrice(pos.symbol);
                                    const change = getLiveChange(pos.symbol);
                                    const isUp = (change ?? 0) >= 0;

                                    let pnl = pos.unrealizedPnl || 0;
                                    if (ltp) {
                                        const qty = Number(pos.quantity);
                                        const avg = Number(pos.avgPrice);
                                        pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
                                    }

                                    return (
                                        <tr key={pos.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-4 px-4 text-muted-foreground">{(page - 1) * limit + i + 1}</td>
                                            <td className="py-4 px-4 font-extrabold">{pos.symbol}</td>
                                            <td className="py-4 px-4">
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] font-bold px-2 py-0",
                                                    pos.side === 'BUY' ? 'text-profit border-profit/20 bg-profit/5' : 'text-loss border-loss/20 bg-loss/5'
                                                )}>
                                                    {pos.side}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono font-medium">{pos.quantity}</td>
                                            <td className="py-4 px-4 text-right font-mono text-muted-foreground">{fmt(Number(pos.avgPrice))}</td>
                                            <td className="py-4 px-4 text-right">
                                                {ltp ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-mono font-bold">{fmt(ltp)}</span>
                                                        {change !== null && (
                                                            <span className={cn("text-[10px] flex items-center gap-0.5", isUp ? "text-profit" : "text-loss")}>
                                                                {isUp ? "+" : ""}{change.toFixed(2)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : "—"}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className={cn("font-bold font-mono", pnl >= 0 ? "text-profit" : "text-loss")}>
                                                    {fmtPnl(pnl)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-4 text-[10px] font-black tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 rounded-xl active:scale-95 uppercase"
                                                    onClick={() => handleClose(pos.id, pos.symbol)}
                                                    disabled={closingId === pos.id || ltp === null}
                                                >
                                                    {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "EXIT"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader title="Portfolio" subtitle="Monitor your live positions and holdings" />

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadData} className="h-9 px-3">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-colors",
                        connected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        <Activity className={cn("h-3 w-3", connected && "animate-pulse")} />
                        {connected ? "LIVE" : "DISCONNECTED"}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-16 w-16 text-emerald-500" />
                    </div>
                    <CardHeader className="p-5 pb-2">
                        <p className="text-[9px] md:text-xs uppercase tracking-[0.2em] font-black text-muted-foreground">Today's P&L Status</p>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <h3 className={cn("text-2xl md:text-3xl font-black font-mono tracking-tighter", totalTodayPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {fmtPnl(totalTodayPnl)}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5 font-black uppercase tracking-tight">
                            {totalTodayPnl >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-rose-500" />}
                            Realized + Unrealized
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <RefreshCcw className="h-16 w-16 text-primary" />
                    </div>
                    <CardHeader className="p-5 pb-2">
                        <p className="text-[9px] md:text-xs uppercase tracking-[0.2em] font-black text-muted-foreground">Total Unrealized</p>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <h3 className={cn("text-2xl md:text-3xl font-black font-mono tracking-tighter", totalUnrealizedPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {fmtPnl(totalUnrealizedPnl)}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1.5 font-black uppercase tracking-tight flex items-center gap-1.5">
                            <Activity className="h-3 w-3" />
                            Active open positions
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search symbol..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 h-9 bg-background/50"
                        />
                    </div>

                </div>

                <Tabs defaultValue="positions" className="w-full">
                    <div className="px-4 pt-4">
                        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                            <TabsTrigger value="positions" className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all px-6">
                                Positions ({positions.length})
                            </TabsTrigger>
                            <TabsTrigger value="holdings" className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all px-6">
                                Holdings ({holdings.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="positions" className="p-4 pt-2">
                        {loading && positions.length === 0 ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : renderTable(positions, 'position')}
                    </TabsContent>

                    <TabsContent value="holdings" className="p-4 pt-2">
                        {loading && holdings.length === 0 ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : renderTable(holdings, 'holding')}
                    </TabsContent>
                </Tabs>
            </Card>

            <div className="flex items-center gap-2 p-4 bg-muted/10 rounded-xl border border-dashed border-border/60">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    All prices are real-time from Alice Blue. Trades are executed instantly based on market liquidity.
                </p>
            </div>
        </div>
    );
};

export default PositionsPage;
