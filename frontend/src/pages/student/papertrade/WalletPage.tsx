import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Wallet, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import tradeService, { type PortfolioSummary, type Position, type Trade } from "@/services/trade.service";

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
            setTradeHistory(hist || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                <PageHeader title="Virtual Wallet" subtitle="Funds and statistics for paper trading" />
                <Button size="icon" variant="ghost" onClick={loadData}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary text-primary-foreground md:col-span-1 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Available Funds</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-4xl font-black">₹{(portfolio?.walletBalance || 0).toLocaleString("en-IN")}</p>
                            <p className="text-xs opacity-70">Virtual simulation currency</p>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold opacity-60">Session Gain</span>
                                <span className="text-sm font-black">{formatPnl(portfolio?.netPnl || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold opacity-60">Active Trades</span>
                                <span className="text-sm font-black">{positions.length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase">Financial Summary</CardTitle>
                        <CardDescription>A breakdown of your trading activity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Brokerage and In-use funds removed as per user request */}

                        <div className="mt-6">
                            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <Star className="h-4 w-4 text-primary" /> Trading Statistics
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs p-2 hover:bg-muted/30 rounded-lg">
                                    <span className="text-muted-foreground font-medium">Executed Trades</span>
                                    <span className="font-black">{tradeHistory.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs p-2 hover:bg-muted/30 rounded-lg">
                                    <span className="text-muted-foreground font-medium">Win Rate</span>
                                    <span className="font-black">
                                        {tradeHistory.length > 0
                                            ? `${((tradeHistory.filter(t => (t.pnl || 0) > 0).length / tradeHistory.length) * 100).toFixed(0)}%`
                                            : "0%"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WalletPage;
