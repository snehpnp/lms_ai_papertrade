import { Users, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import PageHeader from "@/components/common/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const profitData = [
  { month: "Jan", profit: 4200, loss: 1200 },
  { month: "Feb", profit: 5800, loss: 900 },
  { month: "Mar", profit: 3900, loss: 1800 },
  { month: "Apr", profit: 7200, loss: 600 },
  { month: "May", profit: 6100, loss: 1400 },
  { month: "Jun", profit: 8500, loss: 800 },
  { month: "Jul", profit: 7800, loss: 1100 },
];

const activityData = [
  { day: "Mon", trades: 45 },
  { day: "Tue", trades: 62 },
  { day: "Wed", trades: 38 },
  { day: "Thu", trades: 71 },
  { day: "Fri", trades: 56 },
  { day: "Sat", trades: 28 },
  { day: "Sun", trades: 15 },
];

const recentTrades = [
  { user: "John Doe", symbol: "EUR/USD", profit: 245.5, status: "Closed" },
  { user: "Jane Smith", symbol: "GBP/JPY", profit: -120.3, status: "Closed" },
  { user: "Mike Chen", symbol: "BTC/USD", profit: 890.0, status: "Open" },
  { user: "Sara Wilson", symbol: "XAU/USD", profit: -45.8, status: "Closed" },
  { user: "Alex Brown", symbol: "USD/JPY", profit: 312.6, status: "Open" },
];

const AdminDashboard = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your trading overview." />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value="2,847"
          icon={Users}
          trend={{ value: "12% this month", positive: true }}
        />
        <StatCard
          title="Active Traders"
          value="1,234"
          icon={TrendingUp}
          trend={{ value: "8% this week", positive: true }}
          iconColor="bg-accent/10 text-accent"
        />
        <StatCard
          title="Total Trades"
          value="15,672"
          icon={BarChart3}
          trend={{ value: "5% today", positive: true }}
          iconColor="bg-profit/10 text-profit-foreground"
        />
        <StatCard
          title="Total Profit"
          value="$284,590"
          icon={DollarSign}
          trend={{ value: "3% this month", positive: false }}
          iconColor="bg-loss/10 text-loss-foreground"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-card-foreground mb-4">Profit & Loss</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={profitData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 46%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="profit" stroke="hsl(142, 71%, 45%)" fill="url(#profitGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="loss" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-card-foreground mb-4">Trade Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 46%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="trades" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-card-foreground">Recent Trades</h3>
          <button className="text-sm text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Symbol</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Profit/Loss</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 text-foreground font-medium">{trade.user}</td>
                  <td className="px-5 py-3 text-foreground">{trade.symbol}</td>
                  <td className={`px-5 py-3 font-semibold ${trade.profit >= 0 ? "text-profit-foreground" : "text-loss-foreground"}`}>
                    {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === "Open"
                          ? "bg-profit/10 text-profit-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
