import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import tradeService, { type Trade } from "@/services/trade.service";

const TradeHistoryPage = () => {
    const [history, setHistory] = useState<Trade[]>([]);
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

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tradeService.getTradeHistory({
                symbol: debouncedSearch,
                page,
                limit
            });
            setHistory(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalRecords(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, limit]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const columns: Column<Trade>[] = [
        {
            header: "#",
            render: (_row: Trade, index: number) => (
                <span className="font-medium text-sm">{index + 1}</span>
            ),
            className: "w-16 text-center",
        },
        {
            header: "Executed At",
            render: (trade) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(trade.executedAt).toLocaleString()}
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
            render: (trade) => (
                <Badge variant="secondary">{trade.side}</Badge>
            ),
        },
        {
            header: "Price",
            className: "",
            render: (trade) => <span className="text-xs font-medium">₹{trade?.price}</span>,
        },
        {
            header: "Qty",
            accessor: "quantity",
            className: " font-medium",
        },
        {
            header: "P&L",
            className: " font-black",
            render: (trade) => (
                <span className={cn((trade.pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                    {trade.pnl != null ? formatPnl(trade.pnl) : "—"}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader title="Execution History" subtitle="Full log of your executed trades" />

            <DataTable
                columns={columns}
                data={history}
                isLoading={loading}
                emptyMessage="No trade history found."
                searchPlaceholder="Search by symbol..."
                searchValue={search}
                onSearchChange={setSearch}
                page={page}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={setPage}
                renderMobileCard={(trade) => (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-tight">{trade.symbol}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    {new Date(trade.executedAt).toLocaleString()}
                                </p>
                            </div>
                            <Badge className={cn("text-[9px] font-black uppercase tracking-widest", trade.side === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                {trade.side}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50">
                            <div>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-0.5">Price</p>
                                <p className="text-xs font-bold font-mono">₹{trade.price}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-0.5">Qty</p>
                                <p className="text-xs font-bold font-mono">{trade.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-0.5">P&L</p>
                                <p className={cn("text-xs font-black font-mono", (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                                    {trade.pnl != null ? formatPnl(trade.pnl) : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default TradeHistoryPage;
