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
import RiskModal from "@/components/trading/RiskModal";
import { ShieldAlert } from "lucide-react";
import DataTable, { Column } from "@/components/common/DataTable";

const PositionsPage = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [holdings, setHoldings] = useState<Position[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [closingId, setClosingId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [riskModal, setRiskModal] = useState<{
        isOpen: boolean;
        position: Position | null;
    }>({
        isOpen: false,
        position: null,
    });

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

        const columns: Column<Position>[] = [
            {
                header: "#",
                className: "w-12 text-left text-muted-foreground font-bold px-4",
                render: (_, index) => <span className="text-[10px]">{(page - 1) * limit + index + 1}</span>
            },
            {
                header: "Symbol",
                className: "min-w-[140px] px-4",
                render: (pos) => (
                    <div className="flex flex-col">
                        <span className="font-black text-xs uppercase tracking-tight">{pos.symbol}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                            {symbolTokenMap[pos.symbol]?.exchange || "—"}
                        </span>
                    </div>
                )
            },
            {
                header: "Side",
                className: "text-center w-20 px-4",
                render: (pos) => (
                    <Badge className={cn(
                        "text-[9px] font-black px-2 py-0 h-4 uppercase tracking-tighter border-none",
                        pos.side === 'BUY' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                    )}>
                        {pos.side}
                    </Badge>
                )
            },
            {
                header: "Net Qty",
                className: "text-right font-mono font-bold w-24 px-4",
                accessor: "quantity" as any
            },
            {
                header: "Avg Price",
                className: "text-right font-mono font-bold min-w-[110px] px-4",
                render: (pos) => fmt(Number(pos.avgPrice))
            },
            {
                header: "LTP",
                className: "text-right font-mono font-bold min-w-[110px] px-4",
                render: (pos) => {
                    const ltp = getLivePrice(pos.symbol);
                    const change = getLiveChange(pos.symbol);
                    const isUp = (change ?? 0) >= 0;
                    return (
                        <div className="flex flex-col items-end">
                            <span>{ltp ? fmt(ltp) : "—"}</span>
                            {change !== null && (
                                <span className={cn("text-[10px] font-black", isUp ? "text-emerald-500" : "text-rose-500")}>
                                    {isUp ? "+" : ""}{change.toFixed(2)}%
                                </span>
                            )}
                        </div>
                    );
                }
            },
            {
                header: "Target/SL",
                className: "text-center min-w-[120px] px-4",
                render: (pos) => (
                    <div className="flex flex-col items-center gap-0.5">
                        {pos.target ? (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-1.5 rounded">T: ₹{Number(pos.target).toFixed(0)}</span>
                        ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                        {pos.stopLoss ? (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/5 px-1.5 rounded">S: ₹{Number(pos.stopLoss).toFixed(0)}</span>
                        ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                    </div>
                )
            },
            {
                header: "P&L",
                className: "text-right font-mono min-w-[120px] px-4",
                render: (pos) => {
                    const ltp = getLivePrice(pos.symbol);
                    let pnl = pos.unrealizedPnl || 0;
                    if (ltp) {
                        const qty = Number(pos.quantity);
                        const avg = Number(pos.avgPrice);
                        pnl = pos.side === 'BUY' ? (ltp - avg) * qty : (avg - ltp) * qty;
                    }
                    return (
                        <span className={cn("font-black text-sm tracking-tighter", pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {fmtPnl(pnl)}
                        </span>
                    );
                }
            },
            {
                header: "Actions",
                className: "text-right min-w-[140px] px-4",
                render: (pos) => {
                    const ltp = getLivePrice(pos.symbol);
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-primary/20 bg-primary/5 text-primary rounded-xl"
                                onClick={() => setRiskModal({ isOpen: true, position: pos })}
                            >
                                <ShieldAlert className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-4 text-[9px] font-black tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 rounded-xl transition-all active:scale-95 uppercase"
                                onClick={() => handleClose(pos.id, pos.symbol)}
                                disabled={closingId === pos.id || ltp === null}
                            >
                                {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "EXIT"}
                            </Button>
                        </div>
                    );
                }
            }
        ];

        return (
            <DataTable
                columns={columns}
                data={paginated}
                isLoading={loading}
                emptyMessage={`No ${type === 'position' ? 'open positions' : 'holdings'} found.`}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                disableSearch={true} // We have a separate search bar in the UI
                renderMobileCard={(pos) => {
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
                        <div key={pos.id} className="bg-card border border-border/50 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-primary/20 transition-all active:bg-muted/5 p-4 mb-3">
                            <div className="relative z-10 flex-1 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm uppercase text-foreground truncate max-w-[70%]">{pos.symbol}</span>
                                    <Badge className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border-none",
                                        pos.side === 'BUY' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                                    )}>
                                        {pos.side}
                                    </Badge>
                                </div>

                                <div className="pb-3 border-b border-border/40 grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Qty</span>
                                        <span className="text-sm font-bold text-foreground">{pos.quantity}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Avg Price</span>
                                        <span className="text-sm font-bold text-foreground">₹{Number(pos.avgPrice).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">LTP</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-bold font-mono text-foreground">{ltp ? fmt(ltp).replace('₹', '') : "—"}</span>
                                            {change !== null && (
                                                <span className={cn("text-[10px] font-bold", isUp ? "text-emerald-500" : "text-rose-500")}>
                                                    {isUp ? "+" : ""}{change.toFixed(2)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Total P&L</span>
                                        <span className={cn(
                                            "font-black text-xl font-mono tracking-tighter",
                                            pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {fmtPnl(pnl)}
                                        </span>
                                    </div>
                                </div>

                                {(pos.target || pos.stopLoss) && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {pos.target && (
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                                T: ₹{Number(pos.target).toFixed(1)}
                                            </span>
                                        )}
                                        {pos.stopLoss && (
                                            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                                                SL: ₹{Number(pos.stopLoss).toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/40 relative z-10 flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-10 w-12 p-0 border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10 rounded-xl shrink-0"
                                    onClick={() => setRiskModal({ isOpen: true, position: pos })}
                                >
                                    <ShieldAlert className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-10 text-[11px] font-black tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 rounded-xl transition-all active:scale-95 uppercase"
                                    onClick={() => handleClose(pos.id, pos.symbol)}
                                    disabled={closingId === pos.id || ltp === null}
                                >
                                    {closingId === pos.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "EXIT POSITION"}
                                </Button>
                            </div>
                        </div>
                    );
                }}
                className="border-none shadow-none"
            />
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto md:p-6 pb-20 animate-in fade-in duration-500">
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

            {/* Combined Summary Card */}
            <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity hidden md:block">
                    <TrendingUp className="h-24 w-24 text-primary" />
                </div>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 divide-x divide-border/30">
                        <div className="p-4 md:p-6 space-y-1">
                            <p className="text-[9px] md:text-xs uppercase tracking-[0.2em] font-black text-muted-foreground">Today's P&L</p>
                            <h3 className={cn("text-lg md:text-3xl font-black font-mono tracking-tighter", totalTodayPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                {fmtPnl(totalTodayPnl)}
                            </h3>
                            <div className="flex items-center gap-1.5 opacity-70">
                                {totalTodayPnl >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-rose-500" />}
                                <span className="text-[8px] md:text-[10px] font-black uppercase">Combined</span>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 space-y-1">
                            <p className="text-[9px] md:text-xs uppercase tracking-[0.2em] font-black text-muted-foreground">Total Unrealized</p>
                            <h3 className={cn("text-lg md:text-3xl font-black font-mono tracking-tighter", totalUnrealizedPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                {fmtPnl(totalUnrealizedPnl)}
                            </h3>
                            <div className="flex items-center gap-1.5 opacity-70">
                                <Activity className="h-3 w-3 text-primary" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase">Open Trades</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

            <RiskModal
                isOpen={riskModal.isOpen}
                onClose={() => setRiskModal(prev => ({ ...prev, isOpen: false }))}
                position={riskModal.position as any}
                onUpdate={loadData}
            />
        </div>
    );
};

export default PositionsPage;
