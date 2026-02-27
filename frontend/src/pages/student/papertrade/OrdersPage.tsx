import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import tradeService, { type Order } from "@/services/trade.service";

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // API Search and Pagination State
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tradeService.getOrders({
                symbol: debouncedSearch,
                page,
                limit
            });
            setOrders(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalRecords(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, limit]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const columns: Column<Order>[] = [
        {
            header: "#",
            render: (_row: Order, index: number) => (
                <span className="font-medium text-sm">{index + 1}</span>
            ),
            className: "w-16 text-center",
        },
        {
            header: "Time",
            render: (order) => (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleTimeString()}
                </span>
            ),
        },
        {
            header: "Symbol",
            accessor: "symbol",
            className: "font-bold",
        },
        {
            header: "Side",
            render: (order) => (
                <Badge className={order.side === 'BUY' ? 'bg-profit/10 text-profit border-0' : 'bg-loss/10 text-loss border-0'}>
                    {order.side}
                </Badge>
            ),
        },
        {
            header: "Price",
            className: "",
            render: (order) => <span className="text-xs font-medium">₹{order.price || "MKT"}</span>,
        },
        {
            header: "Qty",
            accessor: "quantity",
            className: " font-medium",
        },
        {
            header: "Status",
            className: "",
            render: (order) => (
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[10px]",
                        order.status === 'FILLED' ? "border-profit text-profit" :
                            order.status === 'PENDING' ? "border-amber-500 text-amber-500" : "border-loss text-loss"
                    )}
                >
                    {order.status}
                </Badge>
            ),
        },
        {
            header: "Remark",
            className: "text-center",
            render: (order) => (
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground whitespace-nowrap">
                    {order.remark || "—"}
                </span>
            ),
        }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto  md:p-6 pb-20">
            <PageHeader title="Order Book" subtitle="Status of all your submitted orders" />

            <DataTable
                columns={columns}
                data={orders}
                isLoading={loading}
                emptyMessage="No orders found."
                searchPlaceholder="Search by symbol..."
                searchValue={search}
                onSearchChange={setSearch}
                page={page}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={setPage}
                renderMobileCard={(order) => (
                    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-muted/20 rounded-full -mr-8 -mt-8 pointer-events-none" />
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="space-y-0.5">
                                <h4 className="font-black text-sm uppercase tracking-tight">{order.symbol}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[9px] font-black h-5 px-2 uppercase tracking-widest",
                                    order.status === 'FILLED' ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" :
                                        order.status === 'PENDING' ? "border-amber-500/50 text-amber-500 bg-amber-500/5" : "border-rose-500/50 text-rose-500 bg-rose-500/5"
                                )}
                            >
                                {order.status}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/40 relative z-10">
                            <div>
                                <p className="text-[8px] uppercase text-muted-foreground font-black tracking-[0.1em] mb-1">Side</p>
                                <p className={cn("text-xs font-black uppercase tracking-widest", order.side === 'BUY' ? "text-emerald-500" : "text-rose-500")}>
                                    {order.side}
                                </p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase text-muted-foreground font-black tracking-[0.1em] mb-1">Price</p>
                                <p className="text-xs font-mono font-black">₹{order.price || "MKT"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] uppercase text-muted-foreground font-black tracking-[0.1em] mb-1">Quantity</p>
                                <p className="text-xs font-mono font-black">{order.quantity}</p>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default OrdersPage;
