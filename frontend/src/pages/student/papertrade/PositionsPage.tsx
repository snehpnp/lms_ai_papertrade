import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Loader2, TrendingUp, TrendingDown, Activity,
    Search, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService, { type Position } from "@/services/trade.service";
import { useLivePrices } from "@/hooks/useLivePrice";
import axiosInstance from "@/lib/axios";

const PositionsPage = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [closingId, setClosingId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const loadPositions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tradeService.getOpenPositions();
            setPositions(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPositions(); }, [loadPositions]);

    // Fetch exchange + token for live price
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
            loadPositions();
        } catch { toast.error("Failed to close position"); }
        finally { setClosingId(null); }
    };

    // Filtering + Pagination
    const filteredPositions = useMemo(() => {
        if (!search.trim()) return positions;
        const s = search.toLowerCase();
        return positions.filter(p => p.symbol.toLowerCase().includes(s) || p.side.toLowerCase().includes(s));
    }, [positions, search]);

    const totalPages = Math.max(1, Math.ceil(filteredPositions.length / limit));
    const paginatedPositions = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredPositions.slice(start, start + limit);
    }, [filteredPositions, page]);

    useEffect(() => { setPage(1); }, [search]);

    const fmt = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtPnl = (val: number) => `${val >= 0 ? "+" : ""}₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <div className="flex items-center justify-between">
                <PageHeader title="Open Positions" subtitle="Your active trades in the market" />
                {connected && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Activity className="h-3 w-3 text-green-500" />
                        <span>Live</span>
                    </div>
                )}
            </div>

            <Card className="border border-border shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by symbol or side..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        Total Records: {filteredPositions.length}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-12">#</th>
                                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground min-w-[140px]">Symbol</th>
                                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-16">Side</th>
                                <th className="py-3 px-4 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-16">Qty</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground min-w-[100px]">Avg Price</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground min-w-[120px]">LTP</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground min-w-[100px]">P&L</th>
                                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground min-w-[180px]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs text-muted-foreground">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedPositions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <p className="text-sm text-muted-foreground italic">No open positions.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPositions.map((pos, i) => {
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
                                        <tr key={pos.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            {/* # */}
                                            <td className="py-3 px-4 text-center text-muted-foreground font-medium">
                                                {(page - 1) * limit + i + 1}
                                            </td>

                                            {/* Symbol */}
                                            <td className="py-3 px-4">
                                                <p className="font-semibold">{pos.symbol}</p>
                                            </td>

                                            {/* Side */}
                                            <td className="py-3 px-4">
                                                <Badge className={cn(
                                                    "text-[9px] px-2 py-0.5 border-0 font-bold",
                                                    pos.side === 'BUY' ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'
                                                )}>
                                                    {pos.side}
                                                </Badge>
                                            </td>

                                            {/* Qty */}
                                            <td className="py-3 px-4 text-center font-medium font-mono">
                                                {pos.quantity}
                                            </td>

                                            {/* Avg Price */}
                                            <td className="py-3 px-4 text-right font-mono font-medium">
                                                {fmt(Number(pos.avgPrice))}
                                            </td>

                                            {/* LTP */}
                                            <td className="py-3 px-4 text-right">
                                                {ltp !== null ? (
                                                    <div>
                                                        <p className="font-mono font-semibold">{fmt(ltp)}</p>
                                                        {change !== null && (
                                                            <p className={cn("text-[10px] font-medium flex items-center justify-end gap-0.5", isUp ? "text-profit" : "text-loss")}>
                                                                {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                                                {isUp ? "+" : ""}{change.toFixed(2)}%
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>

                                            {/* P&L */}
                                            <td className="py-3 px-4 text-right">
                                                <span className={cn("font-bold font-mono", pnl >= 0 ? "text-profit" : "text-loss")}>
                                                    {fmtPnl(pnl)}
                                                </span>
                                            </td>

                                            {/* Exit Action */}
                                            <td className="py-3 px-4">
                                                <div className="flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 text-[10px] px-4 font-bold"
                                                        onClick={() => handleClose(pos.id, pos.symbol)}
                                                        disabled={closingId === pos.id || ltp === null}
                                                    >
                                                        {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : ltp !== null ? `EXIT @ ${fmt(ltp)}` : "EXIT"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <div className="text-sm text-muted-foreground font-medium">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            disabled={page === 1 || loading}
                            onClick={() => setPage(Math.max(1, page - 1))}
                            className="gap-1 font-bold"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={page === totalPages || totalPages === 0 || loading}
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            className="gap-1 font-bold"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PositionsPage;
