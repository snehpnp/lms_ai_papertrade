import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

const mockTrades = [
  { user: "John Doe", symbol: "EUR/USD", lotSize: 1.0, openPrice: 1.0854, closePrice: 1.0892, profit: 380.0, time: "2024-12-15 14:30", status: "Closed" },
  { user: "Jane Smith", symbol: "GBP/JPY", lotSize: 0.5, openPrice: 192.45, closePrice: 191.80, profit: -325.0, time: "2024-12-15 13:15", status: "Closed" },
  { user: "Mike Chen", symbol: "BTC/USD", lotSize: 0.1, openPrice: 42150.0, closePrice: 43200.0, profit: 1050.0, time: "2024-12-15 12:00", status: "Open" },
  { user: "Sara Wilson", symbol: "XAU/USD", lotSize: 0.2, openPrice: 2045.5, closePrice: 2038.2, profit: -146.0, time: "2024-12-15 11:45", status: "Closed" },
  { user: "Alex Brown", symbol: "USD/JPY", lotSize: 1.5, openPrice: 149.32, closePrice: 149.85, profit: 530.0, time: "2024-12-15 10:30", status: "Open" },
  { user: "Emily Davis", symbol: "AUD/USD", lotSize: 0.8, openPrice: 0.6589, closePrice: 0.6612, profit: 184.0, time: "2024-12-15 09:00", status: "Closed" },
];

const AnalyticsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = mockTrades.filter(
    (t) =>
      t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Global Trade Analytics" subtitle="View all trade data across the platform" />

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by user or symbol..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" className="w-auto" />
            <Input type="date" className="w-auto" />
            <select className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm">
              <option>All</option>
              <option>Profit</option>
              <option>Loss</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Lot Size</TableHead>
              <TableHead>Open Price</TableHead>
              <TableHead>Close Price</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((trade, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{trade.user}</TableCell>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>{trade.lotSize}</TableCell>
                <TableCell>{trade.openPrice}</TableCell>
                <TableCell>{trade.closePrice}</TableCell>
                <TableCell className={`font-semibold ${trade.profit >= 0 ? "text-profit-foreground" : "text-loss-foreground"}`}>
                  {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{trade.time}</TableCell>
                <TableCell>
                  <Badge variant={trade.status === "Open" ? "default" : "secondary"}>{trade.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnalyticsPage;
