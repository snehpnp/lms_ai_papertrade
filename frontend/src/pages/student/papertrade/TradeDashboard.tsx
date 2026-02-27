import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity, Zap, RefreshCw, IndianRupee,
    TrendingUp, TrendingDown, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import tradeService, {
    type Order, type Position, type PortfolioSummary
} from "@/services/trade.service";
import axiosInstance from "@/lib/axios";
import { useLivePrices } from "@/hooks/useLivePrice";
import { useProfileStore } from "@/store/profileStore";

const PaperTradeDashboard = () => {
    const { userProfile, fetchProfile } = useProfileStore();
    const [positions, setPositions] = useState<Position[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setDataLoading(true);
            const [pos, ord, port] = await Promise.all([
                tradeService.getOpenPositions(),
                tradeService.getOrders(),
                tradeService.getPortfolio(),
            ]);
            setPositions(pos || []);
            setOrders(ord?.items || []);
            setPortfolio(port);
        } catch (err) {
            console.error("Dashboard load failed:", err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        fetchProfile();
    }, [loadData, fetchProfile]);

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

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
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />
                    <CardContent className="p-5 md:p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-black">Net Equity</p>
                                <p className="text-xl md:text-2xl font-black font-mono tracking-tighter">
                                    ₹{liveTotalEquity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <IndianRupee className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-all" />
                    <CardContent className="p-5 md:p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-black">Available Balance</p>
                                <p className="text-xl md:text-2xl font-black font-mono tracking-tighter text-blue-500">
                                    ₹{(portfolio?.availableBalance || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-amber-500/10 transition-all" />
                    <CardContent className="p-5 md:p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-black">Used Margin</p>
                                <p className="text-xl md:text-2xl font-black font-mono tracking-tighter text-amber-500">
                                    ₹{(portfolio?.usedMargin || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                <Activity className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
                    <CardContent className="p-5 md:p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-black">Today's P&L</p>
                                <p className={cn("text-xl md:text-2xl font-black font-mono tracking-tighter", liveTotalPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                    {formatPnl(liveTotalPnl)}
                                </p>
                            </div>
                            <div className={cn("p-2.5 rounded-xl", liveTotalPnl >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                                {liveTotalPnl >= 0 ? <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" /> : <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-rose-500" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" /> Recent Orders
                        </CardTitle>
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className={cn("h-4 w-4", connected ? "text-green-500 animate-pulse" : "text-profit")} />
                            Top Positions {connected && <Badge variant="outline" className="ml-1 text-[8px] h-4 leading-none bg-green-500/10 text-green-500 border-green-500/20 px-1.5">LIVE</Badge>}
                        </CardTitle>
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
