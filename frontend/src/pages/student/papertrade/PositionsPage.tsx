import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService, { type Position } from "@/services/trade.service";

const PositionsPage = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [closingId, setClosingId] = useState<string | null>(null);
    const [exitPrice, setExitPrice] = useState("");

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

    useEffect(() => {
        loadPositions();
    }, [loadPositions]);

    const handleClose = async (id: string) => {
        const price = parseFloat(exitPrice);
        if (!price) { toast.error("Enter exit price"); return; }
        try {
            setClosingId(id);
            await tradeService.closePosition(id, price);
            toast.success("Position closed");
            loadPositions();
        } catch (err) {
            toast.error("Failed to close");
        } finally {
            setClosingId(null);
        }
    };

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader title="Open Positions" subtitle="Your active trades in the market" />

            <Card>
                <CardContent className="pt-6 px-0 md:px-6">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="text-[10px] uppercase">Symbol</TableHead>
                                <TableHead className="text-[10px] uppercase">Side</TableHead>
                                <TableHead className="text-right text-[10px] uppercase">Qty</TableHead>
                                <TableHead className="text-right text-[10px] uppercase">Avg Price</TableHead>
                                <TableHead className="text-right text-[10px] uppercase">P&L</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                            ) : positions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                        <Activity className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p>No open positions</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                positions.map(pos => (
                                    <TableRow key={pos.id}>
                                        <TableCell className="">{pos.symbol}</TableCell>
                                        <TableCell>
                                            <Badge className={pos.side === 'BUY' ? 'bg-profit text-white border-0' : 'bg-loss text-white border-0'}>
                                                {pos.side}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{pos.quantity}</TableCell>
                                        <TableCell className="text-right text-xs">₹{pos.avgPrice}</TableCell>
                                        <TableCell className={cn("text-right ", (pos.unrealizedPnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                                            {formatPnl(pos.unrealizedPnl || 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end items-center">
                                                <Input placeholder="Exit Price" className="h-8 w-24 text-[10px]" type="number" onChange={e => setExitPrice(e.target.value)} />
                                                <Button size="sm" variant="destructive" className="h-8 text-[10px]" onClick={() => handleClose(pos.id)} disabled={closingId === pos.id}>
                                                    {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "EXIT"}
                                                </Button>
                                            </div>
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

export default PositionsPage;
