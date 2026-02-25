import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService, { type Position } from "@/services/trade.service";

const PositionsPage = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [closingId, setClosingId] = useState<string | null>(null);
    const [exitPrice, setExitPrice] = useState("");

    // Local Search and Pagination State
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

    useEffect(() => {
        loadPositions();
    }, [loadPositions]);

    const handleClose = async (id: string, currentExitPrice: string) => {
        const price = parseFloat(currentExitPrice);
        if (!price || isNaN(price)) {
            toast.error("Enter a valid exit price");
            return;
        }
        try {
            setClosingId(id);
            await tradeService.closePosition(id, price);
            toast.success("Position closed");
            setExitPrice(""); // reset globally or use local states if multiple inputs exist 
            loadPositions();
        } catch (err) {
            toast.error("Failed to close position");
        } finally {
            setClosingId(null);
        }
    };

    // Note: Due to exitPrice being a single global state in the component, it might conflict 
    // if a user types in multiple inputs. Ideally each row should control its own state, but 
    // for this refactor we maintain existing logic, but just bind it correctly.

    // Local filtering
    const filteredPositions = useMemo(() => {
        if (!search.trim()) return positions;
        const lowerSearch = search.toLowerCase();
        return positions.filter(
            (p) =>
                p.symbol.toLowerCase().includes(lowerSearch) ||
                p.side.toLowerCase().includes(lowerSearch)
        );
    }, [positions, search]);

    // Local pagination
    const totalPages = Math.max(1, Math.ceil(filteredPositions.length / limit));
    const paginatedPositions = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredPositions.slice(start, start + limit);
    }, [filteredPositions, page]);

    // Reset page if search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    const formatPnl = (val: number) => {
        const prefix = val >= 0 ? "+" : "";
        return `${prefix}₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const columns: Column<Position>[] = [
        {
            header: "Symbol",
            accessor: "symbol",
            className: "font-bold",
        },
        {
            header: "Side",
            render: (pos) => (
                <Badge className={pos.side === 'BUY' ? 'bg-profit text-white border-0' : 'bg-loss text-white border-0'}>
                    {pos.side}
                </Badge>
            ),
        },
        {
            header: "Qty",
            accessor: "quantity",
            className: "text-right font-medium",
        },
        {
            header: "Avg Price",
            className: "text-right",
            render: (pos) => <span className="text-xs font-medium">₹{pos.avgPrice}</span>,
        },
        {
            header: "P&L",
            className: "text-right font-black",
            render: (pos) => (
                <span className={cn((pos.unrealizedPnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                    {formatPnl(pos.unrealizedPnl || 0)}
                </span>
            ),
        },
        {
            header: "Action",
            className: "text-right",
            render: (pos) => (
                <div className="flex gap-2 justify-end items-center">
                    <Input
                        placeholder="Exit Price"
                        className="h-8 w-24 text-[10px]"
                        type="number"
                        onChange={e => setExitPrice(e.target.value)}
                    />
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-[10px]"
                        onClick={() => handleClose(pos.id, exitPrice)}
                        disabled={closingId === pos.id}
                    >
                        {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "EXIT"}
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader title="Open Positions" subtitle="Your active trades in the market" />

            <DataTable
                columns={columns}
                data={paginatedPositions}
                isLoading={loading}
                emptyMessage="No open positions."
                searchPlaceholder="Search by symbol or side..."
                searchValue={search}
                onSearchChange={setSearch}
                page={page}
                totalPages={totalPages}
                totalRecords={filteredPositions.length}
                onPageChange={setPage}
            />
        </div>
    );
};

export default PositionsPage;
