import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { motion, AnimatePresence, Variants } from "framer-motion";
import statsService from "@/services/stats.service";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";
import {
  Users, TrendingUp, Briefcase, DollarSign, Calendar, Filter,
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity,
  Crown, PlayCircle, Clock, Search, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Custom Tooltip (theme aware) ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 text-xs shadow-2xl ring-1 ring-black/5">
      <p className="font-bold mb-2 text-foreground/80 flex items-center gap-2">
        <Calendar className="w-3 h-3 text-primary" />
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }}></span>
              {p.name}
            </span>
            <span className="font-bold text-foreground">
              {p.name.includes("Revenue") ? `₹${p.value.toLocaleString()}` : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Motion Variants ───────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// ── Stat Card Component ───────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, trend, index }: any) => {
  const gradients: Record<string, string> = {
    purple: "from-purple-500/20 to-fuchsia-500/5 border-purple-500/20 text-purple-600 dark:text-purple-400",
    emerald: "from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    blue: "from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400",
    rose: "from-rose-500/20 to-orange-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 pb-5 bg-gradient-to-br border shadow-sm transition-all",
        gradients[color] || gradients.blue
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-background/50 backdrop-blur-sm border border-white/20 shadow-inner">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm",
            trend > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          )}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight text-foreground/90">{value}</p>
        <p className="text-sm font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        <Icon size={100} />
      </div>
    </motion.div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState(7);
  const { theme } = useTheme();

  // API State
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [paperStats, setPaperStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, rev, enr, act, tcp, ps] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getRevenueChart(timeRange),
        statsService.getEnrollmentChart(timeRange),
        statsService.getRecentActivities(10),
        statsService.getTopCourses(5),
        statsService.getPaperTradeAnalytics(timeRange),
      ]);
      setStats(s);
      setRevenueData(rev);
      setEnrollmentData(enr);
      setActivities(act);
      setTopCourses(tcp);
      setPaperStats(ps);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: "Active Users", value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: "purple", trend: 12 },
    { label: "Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "emerald", trend: 8.4 },
    { label: "Total Trades", value: (paperStats?.totalTrades || 0).toLocaleString(), icon: Briefcase, color: "blue", trend: -2.1 },
    { label: "Total Profit", value: `₹${(paperStats?.totalRealizedPnl || 0).toLocaleString()}`, icon: TrendingUp, color: "rose", trend: 15.2 },
  ];

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tickColor = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 backdrop-blur-xl p-4 px-6 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            System Intelligence
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Live monitoring and platform telemetry
          </p>
        </div>

        <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border/40 backdrop-blur-sm z-10">
          {[7, 30, 90].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300",
                timeRange === range
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}D
            </button>
          ))}
        </div>

        {/* Abstract background blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] -mr-24 -mt-24"></div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} index={i} />
        ))}
      </div>

      {/* ── Primary Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Flow */}
        <motion.div variants={itemVariants} className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden group">
          <div className="p-8 pb-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  Financial Growth
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Platform Revenue Flow</p>
              </div>
              <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500">REAL-TIME</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
                  />
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={gridColor} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Enrollment Bar Chart */}
        <motion.div variants={itemVariants} className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden group">
          <div className="p-8 pb-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  Learning Engagement
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">User Course Enrollments</p>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-blue-500">METRICS</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
                  />
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={gridColor} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Enrollments"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                    barSize={24}
                    animationDuration={1500}
                  >
                    {enrollmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#3b82f6" : "#60a5fa"}
                        opacity={0.8 + (index / enrollmentData.length) * 0.2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Paper Trade Insights ── */}
      <motion.div variants={itemVariants} className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-purple-500 rounded-full" />
              Paper Trading Performance
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Realized P&L Analytics</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total P&L</p>
              <p className={cn("text-lg font-black", (paperStats?.totalRealizedPnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                ₹{(paperStats?.totalRealizedPnl || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-px h-10 bg-border/50" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Success Rate</p>
              <p className="text-lg font-black text-blue-500">68.4%</p>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={paperStats?.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
              />
              <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={gridColor} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="pnl"
                name="P&L"
                stroke="#8b5cf6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorPnl)"
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Detailed Telemetry ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Recent Activities */}
        <motion.div variants={itemVariants} className="xl:col-span-3 bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-2xl flex flex-col h-[500px] group">
          <div className="p-6 pb-3 flex items-center justify-between border-b border-border/20">
            <div>
              <h3 className="text-xl font-black tracking-tight">System Feed</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Global Activity Stream</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-muted-foreground">LIVE UPDATES</span>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground transition-all">
            <div className="space-y-6 relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border/50 to-transparent" />

              <AnimatePresence mode="popLayout">
                {activities.length > 0 ? activities.map((act, i) => (
                  <motion.div
                    key={act.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-11 group/act"
                  >
                    <div className="absolute left-2.5 top-0 w-5 h-5 rounded-full bg-background border-4 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] z-10 transition-transform group-hover/act:scale-125" />

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-black text-primary uppercase tracking-[0.1em]">
                          {act.action?.replace(/_/g, " ")}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded-full border border-border/20">
                          {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-foreground/80 leading-relaxed mt-2">
                        {(() => {
                          if (!act.details) return act.resource || "Platform event processed.";
                          try {
                            const p = typeof act.details === "string" ? JSON.parse(act.details) : act.details;
                            if (act.action === "COURSE_ENROLLMENT") return `Enrolled in "${p.courseTitle || 'Course'}"`;
                            if (act.action === "USER_LOGIN") return "User session established successfully.";
                            if (act.action === "LIVE_PRICE_TOGGLE") return `Market data manually ${p.enabled ? "enabled" : "disabled"}.`;
                          } catch (e) { }
                          return act.resource || "Telemetric data recorded.";
                        })()}
                      </p>

                      {act.user && (
                        <div className="flex items-center gap-3 mt-4 p-1.5 bg-muted/20 rounded-2xl w-fit border border-border/30 group-hover/act:border-primary/30 transition-colors">
                          <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                            {act.user.name?.charAt(0) || "U"}
                          </div>
                          <span className="text-[11px] font-black tracking-tight">{act.user.name}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center grayscale opacity-50">
                    <Activity size={48} className="text-muted mb-4" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No activities recorded</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Top Courses */}
        <motion.div variants={itemVariants} className="xl:col-span-2 bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-2xl flex flex-col h-[500px] group">
          <div className="p-6 pb-3 border-b border-border/20">
            <h3 className="text-xl font-black tracking-tight">Market Leaders</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">High-Performing Educational Assets</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {topCourses.map((c, i) => (
              <motion.div
                key={c.id || i}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-3xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-5 group/course"
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl overflow-hidden border border-primary/20 shadow-inner">
                    {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" /> : "📚"}
                  </div>
                  {i < 3 && (
                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-4 border-card text-[10px] font-black text-amber-950 shadow-lg">
                      {i + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground line-clamp-1 mb-1">{c.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-lg">₹{(Number(c.price) || 0).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {c._count?.enrollments || 0} Learners
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/course:text-primary group-hover/course:border-primary transition-all">
                  <ChevronRight size={18} />
                </div>
              </motion.div>
            ))}

            {topCourses.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground opacity-50 italic text-sm">
                No course data found
              </div>
            )}
          </div>

          <div className="p-6 bg-primary/5 border-t border-border/20 rounded-b-[2.5rem]">
            <Button variant="ghost" className="w-full rounded-2xl font-black text-[11px] uppercase tracking-widest gap-2">
              View All Content
              <ChevronRight size={14} />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div >
  );
}
