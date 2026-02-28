import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { adminTradingService } from "@/services/admin.service";
import { format } from "date-fns";
import { Search, Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  userId: string;
  symbol: string;
  side: string;
  quantity: string | number;
  price: string | number;
  brokerage: string | number;
  pnl: string | number | null;
  executedAt: string;
  user?: { name: string; email: string };
  order?: { status: string };
}

const AnalyticsPage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [side, setSide] = useState("ALL");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchTrades();
  }, [page, debouncedSearch, side]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await adminTradingService.allTrades({
        page,
        limit,
        search: debouncedSearch || undefined,
        side: side === "ALL" ? undefined : side,
      });
      if (res.data && res.data.items) {
        setTrades(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } else if ((res as any).items) {
        setTrades((res as any).items);
        setTotal((res as any).total);
        setTotalPages((res as any).totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch trades payload:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Trade>[] = [
    {
      header: "#",
      render: (_row: Trade, index: number) => (
        <span className="font-medium">{(page - 1) * limit + index + 1}</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "User",
      render: (trade) => (
        <>
          <div className="font-bold text-foreground">{trade.user?.name || "Unknown"}</div>
          <div className="text-[10px] text-muted-foreground">{trade.user?.email || trade.userId || "N/A"}</div>
        </>
      ),
    },
    {
      header: "Symbol",
      render: (trade) => <span className="font-bold">{trade.symbol}</span>,
    },
    {
      header: "Side",
      render: (trade) => {
        const isBuy = trade.side?.toUpperCase() === "BUY";

        return (
          <Badge
            className={`text-[10px] font-black uppercase tracking-wider ${isBuy
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
          >
            {trade.side}
          </Badge>
        );
      },
    },
    { header: "Qty", accessor: "quantity" },
    {
      header: "Price",
      render: (trade) => <>₹{Number(trade.price).toLocaleString("en-IN")}</>,
    },
    {
      header: "Cost",
      render: (trade) => <>₹{(Number(trade.quantity) * Number(trade.price)).toLocaleString("en-IN")}</>,
    },
    {
      header: "P&L",
      render: (trade) => {
        const pnl = trade.pnl ? Number(trade.pnl) : 0;
        return trade.pnl !== null ? (
          <span className={`font-black ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
            {pnl > 0 ? "+" : ""}
            {pnl.toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground font-bold">Open</span>
        );
      },
    },
    {
      header: "Time",
      render: (trade) => (
        <span className="text-xs text-muted-foreground font-medium">
          {format(new Date(trade.executedAt), "MMM d, HH:mm")}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Global Trade Analytics" subtitle="View all trade data across the platform" />
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm mb-6 mt-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search symbol or user..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={side}
              onChange={(e) => {
                setPage(1);
                setSide(e.target.value);
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[120px]"
            >
              <option value="ALL">All Sides</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchTrades}
            disabled={loading}
            className="rounded-lg h-9 w-9"
          >
            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border/60 shadow-md overflow-hidden mb-8">
        <DataTable
          columns={columns}
          data={trades}
          isLoading={loading}
          emptyMessage="No trades found."
          page={page}
          totalPages={totalPages}
          totalRecords={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
