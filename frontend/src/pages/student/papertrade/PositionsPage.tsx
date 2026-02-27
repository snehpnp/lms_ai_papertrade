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
                <div className="overflow-x-auto rounded-xl border border-border">
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
                                            <td className="py-4 px-4 font-bold">{pos.symbol}</td>
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
                                                    variant="ghost"
                                                    className="h-8 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
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

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadData} className="h-9 px-3">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors",
                        connected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        <Activity className={cn("h-3 w-3", connected && "animate-pulse")} />
                        {connected ? "LIVE DATA CONNECTED" : "LIVE DATA DISCONNECTED"}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-background to-muted/30 border-primary/10 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <TrendingUp className="h-12 w-12 text-profit" />
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Today's Profit & Loss</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <h3 className={cn("text-3xl font-black font-mono", totalTodayPnl >= 0 ? "text-profit" : "text-loss")}>
                            {fmtPnl(totalTodayPnl)}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                            {totalTodayPnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            Combined Realized + Unrealized
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-background to-muted/30 border-primary/10 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <RefreshCcw className="h-12 w-12 text-primary" />
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Overall Unrealized P&L</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <h3 className={cn("text-3xl font-black font-mono", totalUnrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
                            {fmtPnl(totalUnrealizedPnl)}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Active open positions only</p>
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
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg border border-border">
                            <span className="text-blue-500">POSITIONS:</span>
                            <span className="text-foreground">{positions.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg border border-border">
                            <span className="text-emerald-500">HOLDINGS:</span>
                            <span className="text-foreground">{holdings.length}</span>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="positions" className="w-full">
                    <div className="px-4 pt-4">
                        <TabsList className="grid w-[400px] grid-cols-2 bg-muted/50 p-1">
                            <TabsTrigger value="positions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-tight">
                                Positions ({positions.length})
                            </TabsTrigger>
                            <TabsTrigger value="holdings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-tight">
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
