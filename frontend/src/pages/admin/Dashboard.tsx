import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import statsService from "@/services/stats.service";
import { useTheme } from "@/contexts/ThemeContext";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [s, rev, enr, act, tcp] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getRevenueChart(7),
        statsService.getEnrollmentChart(7),
        statsService.getRecentActivities(20),
        statsService.getTopCourses(5),
      ]);
      setStats(s);
      setRevenueData(rev);
      setEnrollmentData(enr);
      setActivities(act);
      setTopCourses(tcp);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const statCards = [
    { label: "Global Users", value: (stats?.totalUsers || 0).toLocaleString() },
    { label: "Gross Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}` },
    { label: "Active Assets", value: (stats?.totalCourses || 0).toLocaleString() },
    { label: "Enrollments", value: (stats?.totalEnrollments || 0).toLocaleString() },
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
        {statCards.map((c, i) => (
         <div
  key={i}
  style={{
    background: statGradients[i].background
  }}
  className={`relative rounded-md p-5 pb-16 text-white overflow-hidden 
  cursor-default shadow-lg ${statGradients[i].shadow}
  hover:-translate-y-1 transition-transform duration-200`}


          //  className={`relative bg-gradient-to-br ${statGradients[i].bg} rounded-2xl p-5 pb-16 text-white overflow-hidden cursor-default shadow-lg ${statGradients[i].shadow} hover:-translate-y-1 transition-transform duration-200`}
          >
            <p className="text-3xl font-extrabold tracking-tight drop-shadow-sm">{c.value}</p>
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

      {/* ── Top Courses Table ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-4 border-b border-border">
          <span className="text-[15px] font-semibold  text-muted-foreground flex items-center gap-1.5">
            🏆 Top Yielding Courses
          </span>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2.5 text-left text-[14px] font-bold uppercase tracking-wider text-white tableth-bg border-b border-border">Course</th>
              <th className="px-4 py-2.5 text-center text-[14px] font-bold uppercase tracking-wider text-white tableth-bg border-b border-border">Price</th>
              <th className="px-4 py-2.5 text-right text-[14px] font-bold uppercase tracking-wider text-white tableth-bg border-b border-border">Enrollments</th>
            </tr>
          </thead>
          <tbody>
            {topCourses.map((c, i) => (
              <tr key={c.id || i} className="hover:bg-muted/40 transition-colors cursor-default">
                <td className="px-4 py-3 border-b border-border/30">
                  <span className="font-bold text-sm ">{c.title}</span>
                </td>
                <td className="px-4 py-3 text-center border-b border-border/30">
                  <span className="text-muted-foreground font-semibold text-sm">₹{(Number(c.price) || 0).toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right border-b border-border/30 font-extrabold text-[13px] text-foreground">
                  {c._count?.enrollments || 0}
                </td>
              </tr>
            ))}
            {topCourses.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
