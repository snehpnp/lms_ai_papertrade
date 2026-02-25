import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { adminTradingService } from "@/services/admin.service";
import { format } from "date-fns";

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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchTrades();
  }, [page, debouncedSearch]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await adminTradingService.allTrades({
        page,
        limit,
        search: debouncedSearch || undefined,
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
            className={`text-[10px] font-semibold ${isBuy
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
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
      <DataTable
        columns={columns}
        data={trades}
        isLoading={loading}
        emptyMessage="No trades found."
        searchPlaceholder="Search currently not supported yet..."
        searchValue={search}
        onSearchChange={setSearch}
        disableSearch={true}
        page={page}
        totalPages={totalPages}
        totalRecords={total}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AnalyticsPage;
