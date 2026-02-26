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
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
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
            />
        </div>
    );
};

export default OrdersPage;
