import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListOrdered, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import tradeService, { type Order } from "@/services/trade.service";

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tradeService.getOrders();
            setOrders(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader title="Order Book" subtitle="Status of all your submitted orders" />

            <Card>
                <CardContent className="pt-6 px-0 md:px-6">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="text-[10px] uppercase">Time</TableHead>
                                <TableHead className="text-[10px] uppercase">Symbol</TableHead>
                                <TableHead className="text-[10px] uppercase">Side</TableHead>
                                <TableHead className="text-right text-[10px] uppercase">Price</TableHead>
                                <TableHead className="text-right text-[10px] uppercase">Qty</TableHead>
                                <TableHead className="text-center text-[10px] uppercase">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                        <ListOrdered className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p>No orders found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-muted/30">
                                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell className="">{order.symbol}</TableCell>
                                        <TableCell>
                                            <Badge className={order.side === 'BUY' ? 'bg-profit/10 text-profit border-0' : 'bg-loss/10 text-loss border-0'}>
                                                {order.side}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs">₹{order.price || "MKT"}</TableCell>
                                        <TableCell className="text-right">{order.quantity}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    " text-[10px]",
                                                    order.status === 'FILLED' ? "border-profit text-profit" :
                                                        order.status === 'PENDING' ? "border-amber-500 text-amber-500" : "border-loss text-loss"
                                                )}
                                            >
                                                {order.status}
                                            </Badge>
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

export default OrdersPage;
