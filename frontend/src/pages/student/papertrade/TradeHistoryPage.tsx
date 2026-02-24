import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import tradeService, { type Trade } from "@/services/trade.service";

const TradeHistoryPage = () => {
    const [history, setHistory] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tradeService.getTradeHistory();
            setHistory(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader title="Execution History" subtitle="Full log of your executed trades" />

            <Card>
                <CardContent className="pt-6 px-0 md:px-6">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase">Executed At</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Symbol</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Side</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase">Price</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase">Qty</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase">P&L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                        <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p>No trade history found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map(trade => (
                                    <TableRow key={trade.id} className="hover:bg-muted/30">
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(trade.executedAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-black">{trade.symbol}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-bold">{trade.side}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">₹{trade?.price}</TableCell>
                                        <TableCell className="text-right font-bold">{trade.quantity}</TableCell>
                                        <TableCell className={cn("text-right font-black", (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                                            {trade.pnl != null ? formatPnl(trade.pnl) : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default TradeHistoryPage;
