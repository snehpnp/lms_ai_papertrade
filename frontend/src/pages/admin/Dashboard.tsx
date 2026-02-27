import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import statsService from "@/services/stats.service";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";

// ── Spark SVG paths for stat cards ────────────────────────────────────────
const sparkPaths = [
  "M0,15 C10,12 20,18 40,15 C60,12 80,18 100,10",
  "M0,12 C10,12 25,12 30,5 C40,15 60,12 100,12",
  "M0,15 C20,15 40,5 60,15 C80,15 90,12 100,12",
  "M0,10 C20,10 40,10 50,15 C60,10 80,10 100,10",
];

// ── Custom Tooltip (theme aware) ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-bold mb-1 text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="m-0">{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};


// ── Stat Card Gradient Configs ─────────────────────────────────────────────
const statGradients = [
  {
    background: "linear-gradient(#ed68ff, #be0ee1)",
    shadow: "shadow-purple-500/30"
  },
  {
    background: "linear-gradient(#4eda89, #1a9f53)",
    shadow: "shadow-emerald-500/30"
  },
  {
    background: "linear-gradient(#64b3f6, #2b77e5)",
    shadow: "shadow-blue-500/30"
  },
  {
    background: "linear-gradient(#ff6179, #f11133)",
    shadow: "shadow-red-500/30"
  },
];


// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("monthly");
  const { theme } = useTheme();

  // API State
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [paperStats, setPaperStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [s, rev, enr, act, tcp, ps] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getRevenueChart(7),
        statsService.getEnrollmentChart(7),
        statsService.getRecentActivities(20),
        statsService.getTopCourses(5),
        statsService.getPaperTradeAnalytics(7),
      ]);
      setStats(s);
      setRevenueData(rev);
      setEnrollmentData(enr);
      setActivities(act);
      setTopCourses(tcp);
      setPaperStats(ps);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const statCards = [
    { label: "Global Users", value: (stats?.totalUsers || 0).toLocaleString() },
    { label: "Gross Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}` },
    { label: "Total Trades", value: (paperStats?.totalTrades || 0).toLocaleString() },
    { label: "Overall P&L", value: `₹${(paperStats?.totalRealizedPnl || 0).toLocaleString()}`, isPnl: true },
  ];

  // Chart colors that adapt to theme
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const tickColor = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <div className="min-h-full">

      {/* Header */}
      <header className="flex items-center justify-between mb-6 bg-card p-4 rounded-xl">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Analytics</h1>
        <nav className="text-sm text-muted-foreground flex items-center gap-1.5">
          <span className="text-primary font-medium">Home</span> ~
          <span className="text-primary font-medium">Dashboard</span> ~
          <span>Analytics</span>
        </nav>
      </header>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {statCards.map((c: any, i) => (
          <div
            key={i}
            style={{
              background: statGradients[i].background
            }}
            className={`relative rounded-md p-5 pb-16 text-white overflow-hidden 
  cursor-default shadow-lg ${statGradients[i].shadow}
  hover:-translate-y-1 transition-transform duration-200`}
          >
            <p className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {c.value}
            </p>
            <p className="text-[15px] font-medium opacity-90 mt-0.5">{c.label}</p>
            <div className="absolute bottom-3 left-4 right-4 h-8 opacity-80">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full stroke-white fill-none" style={{ strokeWidth: 2.5, strokeLinecap: "round" }}>
                <path d={sparkPaths[i]} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-5">

        {/* Enrollment Bar Chart */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[15px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500" strokeWidth={2.5}><path d="M3 3h18v18H3z" strokeLinejoin="round" /></svg>
              Enrollment Telemetry
            </span>
            <div className="flex gap-1.5">
              {["monthly", "weekly"].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border-none cursor-pointer transition-all duration-200 ${activeTab === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {t === "monthly" ? "📅 Monthly" : "Weekly"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enrollmentData} barGap={2} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor, fontWeight: 600 }} stroke="none" dy={8} />
                <YAxis tick={{ fontSize: 9, fill: tickColor }} stroke="none" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Area Chart */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[15px] font-semibold  text-muted-foreground flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-emerald-500" strokeWidth={2.5}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              Financial Trajectory
            </span>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor, fontWeight: 600 }} stroke="none" dy={8} />
                <YAxis tick={{ fontSize: 9, fill: tickColor }} stroke="none" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#rev)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Paper Trade Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-5">
        
        {/* Paper P&L Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[15px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-purple-500" strokeWidth={2.5}><path d="M12 2v20M2 12h20" /></svg>
              Paper Trading P&L (Realized)
            </span>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={paperStats?.chartData || []} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor, fontWeight: 600 }} stroke="none" dy={8} />
                <YAxis tick={{ fontSize: 9, fill: tickColor }} stroke="none" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pnl" name="P&L" stroke="#8b5cf6" fill="url(#pnl)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Symbols */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-[15px] font-semibold text-muted-foreground">Active Instruments</span>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {paperStats?.topSymbols.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.symbol}</p>
                    <p className="text-[11px] text-muted-foreground">Popularity Peak</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{item.count} trades</p>
                    <div className="w-20 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${(item.count / (paperStats?.totalTrades || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!paperStats?.topSymbols || paperStats.topSymbols.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No trade data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Activities & Top Courses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-5">

        {/* Recent Activities */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[450px]">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
            <h3 className="text-[16px] font-bold text-foreground">Recent Activities</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
            </button>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="relative border-l-2 border-border/50 ml-3 space-y-8 pb-4 pt-1">
              {activities.length > 0 ? activities.map((act, i) => (
                <div key={act.id || i} className="relative pl-7 group">
                  {/* Dot */}
                  <span className="absolute -left-[9px] top-1.5 w-[16px] h-[16px] rounded-full bg-card border-[4px] border-muted-foreground group-hover:border-primary transition-colors"></span>

                  {/* Content Header & Time line */}
                  <div className="flex flex-row items-center gap-3 mb-2">
                    <h4 className="text-[14px] font-bold text-foreground">
                      {act.action ? act.action.replace(/_/g, ' ') : 'SYSTEM ACTIVITY'}
                    </h4>
                    <div className="flex-1 h-px bg-border/50 min-w-[20px]"></div>
                    <span className="text-[12.5px] whitespace-nowrap text-muted-foreground font-medium text-right shrink-0">
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Details / Desc */}
                  <p className="text-[13.5px] text-muted-foreground mb-3 leading-relaxed pr-4">
                    {(() => {
                      if (!act.details) return act.resource ? `Resource: ${act.resource}` : 'System activity recorded securely by the platform.';

                      try {
                        const payload = typeof act.details === 'string' ? JSON.parse(act.details) : act.details;

                        if (act.action === 'COURSE_ENROLLMENT' && payload?.courseTitle) {
                          return `Successfully enrolled in course: "${payload.courseTitle}"`;
                        }
                        if (act.action === 'PROFILE_UPDATE') {
                          return 'Updated profile information.';
                        }
                        if (act.action === 'USER_LOGIN') {
                          return 'User logged into the system.';
                        }
                        if (act.action === 'COURSE_CREATED' && payload?.title) {
                          return `Created a new course: "${payload.title}"`;
                        }

                        if (payload && typeof payload === 'object') {
                          const keys = Object.keys(payload).filter(k => !k.toLowerCase().includes('id'));
                          if (keys.length > 0) {
                            return `${act.resource ? act.resource + ' - ' : ''}` + keys.map(k => `${k}: ${payload[k]}`).join(', ');
                          }
                        }
                      } catch (e) { }

                      return `${act.resource ? `Resource: ${act.resource} ` : ''}${typeof act.details === 'string' ? act.details : JSON.stringify(act.details)}`;
                    })()}
                  </p>

                  {/* User Avatar + Name */}
                  {act.user && (
                    <div className="flex items-center gap-2 mt-3 w-max">
                      {act.user.avatar ? (
                        <img src={act.user.avatar} alt={act.user.name} className="w-7 h-7 rounded-sm object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-sm bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary">
                          {act.user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="text-[13.5px] font-medium text-foreground">{act.user.name}</span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-sm text-muted-foreground pl-6">No recent activities found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Courses Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[450px]">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-foreground">Top Yielding Courses</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-muted/80 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[12px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/50">Course</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/50">Price</th>
                  <th className="px-5 py-3.5 text-right text-[12px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/50">Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((c, i) => (
                  <tr key={c.id || i} className="hover:bg-muted/10 transition-colors cursor-default border-b border-border/30 last:border-none">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden text-lg">
                          {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" /> : "📚"}
                        </div>
                        <span className="font-bold text-sm leading-tight text-foreground line-clamp-2">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-foreground font-semibold text-sm">₹{(Number(c.price) || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-center bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-[13px]">
                        {c._count?.enrollments || 0}
                      </div>
                    </td>
                  </tr>
                ))}
                {topCourses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No top courses available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
