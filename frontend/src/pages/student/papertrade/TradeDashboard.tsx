import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity, Zap, RefreshCw, IndianRupee,
    TrendingUp, TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import tradeService, {
    type Order, type Position, type PortfolioSummary
} from "@/services/trade.service";

const PaperTradeDashboard = () => {
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
            setOrders(ord || []);
            setPortfolio(port);
        } catch (err) {
            console.error("Dashboard load failed:", err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Paper Trading Dashboard"
                    subtitle="Overview of your virtual portfolio"
                />
                <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-xl border border-border">
                    <div className="px-3 border-r border-border">
                        <p className="text-[10px] uppercase text-muted-foreground whitespace-nowrap">Available Balance</p>
                        <p className="text-lg text-foreground">₹{(portfolio?.availableBalance || 0).toLocaleString()}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-10 w-10 shrink-0" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", dataLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Equity</p>
                                <p className="text-2xl mt-1">
                                    ₹{(portfolio?.totalEquity || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Funds</p>
                                <p className="text-2xl mt-1 text-primary">
                                    ₹{(portfolio?.availableBalance || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Zap className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Used Margin</p>
                                <p className="text-2xl mt-1 text-amber-500">
                                    ₹{(portfolio?.usedMargin || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Activity className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Today's P&L</p>
                                <p className={cn("text-2xl  mt-1", (portfolio?.totalPnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                                    {formatPnl(portfolio?.totalPnl || 0)}
                                </p>
                            </div>
                            <div className={cn("p-2 rounded-lg", (portfolio?.totalPnl || 0) >= 0 ? "bg-profit/10" : "bg-loss/10")}>
                                {(portfolio?.totalPnl || 0) >= 0 ? <TrendingUp className="h-5 w-5 text-profit" /> : <TrendingDown className="h-5 w-5 text-loss" />}
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
                    <CardContent>
                        {orders.slice(0, 5).length === 0 ? (
                            <p className="text-center py-6 text-xs text-muted-foreground">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                        <div>
                                            <p className="text-xs">{order.symbol}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{order.side} • {order.orderType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs">₹{order.price || 'MKT'}</p>
                                            <Badge className="h-4 text-[8px]">{order.status}</Badge>
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
                            <Activity className="h-4 w-4 text-profit" /> Top Positions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {positions.length === 0 ? (
                            <p className="text-center py-6 text-xs text-muted-foreground">No open positions</p>
                        ) : (
                            <div className="space-y-3">
                                {positions.slice(0, 5).map(pos => (
                                    <div key={pos.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                        <div>
                                            <p className="text-xs">{pos.symbol}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{pos.side} • {pos.quantity} Qty</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs">₹{pos.avgPrice}</p>
                                            <p className={cn("text-[10px] ", (pos.unrealizedPnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                                                {formatPnl(pos.unrealizedPnl || 0)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PaperTradeDashboard;
