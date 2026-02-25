import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import statsService from "@/services/stats.service";
import { format } from "date-fns";

// ── Mock Data for missing API parts ──────────────────────────────────────────
const sparkPaths = [
  "M0,15 C10,12 20,18 40,15 C60,12 80,18 100,10",
  "M0,12 C10,12 25,12 30,5 C40,15 60,12 100,12",
  "M0,15 C20,15 40,5 60,15 C80,15 90,12 100,12",
  "M0,10 C20,10 40,10 50,15 C60,10 80,10 100,10",
];

const mockCountries = [
  { name: "Bangladesh", flag: "🇧🇩", value: 2500, seo: 90 },
  { name: "United States", flag: "🇺🇸", value: 1400, seo: 85 },
  { name: "Saudi Arabia", flag: "🇸🇦", value: 3900, seo: 70 },
  { name: "Germany", flag: "🇩🇪", value: 4170, seo: 65 },
  { name: "Philippines", flag: "🇵🇭", value: 5298, seo: 58 },
];

const badgeConfig: Record<string, any> = {
  COURSE_ENROLLMENT: { bg: "#dcfce7", color: "#16a34a", label: "Enrolled" },
  LOGIN: { bg: "#dbeafe", color: "#2563eb", label: "Network" },
  default: { bg: "#fef9c3", color: "#ca8a04", label: "Activity" },
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f1f5f9" }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "#94a3b8" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, margin: 0 }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [, setTick] = useState(0);

  // API State
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
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
    { label: "Global Users", value: (stats?.totalUsers || 0).toLocaleString(), color: "linear-gradient(135deg,#d946ef,#a855f7)", shadow: "rgba(168,85,247,0.35)" },
    { label: "Gross Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: "linear-gradient(#4eda89, #1a9f53)", shadow: "rgba(16,185,129,0.35)" },
    { label: "Active Assets", value: (stats?.totalCourses || 0).toLocaleString(), color: "linear-gradient(135deg,#60a5fa,#3b82f6)", shadow: "rgba(59,130,246,0.35)" },
    { label: "Enrollments", value: (stats?.totalEnrollments || 0).toLocaleString(), color: "linear-gradient(#ff6179, #f11133)", shadow: "rgba(239,68,68,0.35)" },
  ];

  const s = {
    root: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f4f8", minHeight: "100vh", color: "#0f172a" },
    header: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 },
    headerTitle: { fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" },
    breadcrumb: { fontSize: 13, color: "#64748b", display: "flex", gap: 6, alignItems: "center" },
    breadLink: { color: "#3b82f6", fontWeight: 500, textDecoration: "none" },
    main: { display: "flex", gap: 0, height: "calc(100vh - 56px)", overflow: "hidden" },
    leftPanel: { flex: 1, overflowY: "auto" as any, padding: "24px 20px 24px 24px" },
    rightPanel: { width: 360, background: "#fff", borderLeft: "1px solid #e2e8f0", overflowY: "auto" as any, display: "flex", flexDirection: "column" as any },

    // Stat Cards
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 },
    statCard: (grad: string, shad: string) => ({
      background: grad,
      borderRadius: 18,
      padding: "20px 20px 60px",
      color: "#fff",
      position: "relative" as any,
      overflow: "hidden",
      boxShadow: `0 8px 24px ${shad}`,
      cursor: "default",
      transition: "transform 0.25s",
    }),
    statVal: { fontSize: 26, fontWeight: 800, letterSpacing: "-1px", textShadow: "0 2px 8px rgba(0,0,0,.15)" },
    statLabel: { fontSize: 13, fontWeight: 500, opacity: 0.9, marginTop: 2 },
    sparkWrap: { position: "absolute" as any, bottom: 14, left: 16, right: 16, height: 32, opacity: 0.85 },
    moreBtn: { position: "absolute" as any, top: 12, right: 10, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },

    // Chart Cards
    chartRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" },
    cardHead: { padding: "14px 18px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" },
    cardTitle: { fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as any, color: "#64748b", display: "flex", alignItems: "center", gap: 6 },
    cardBody: { padding: "14px 8px 10px" },
    tabRow: { display: "flex", gap: 6 },
    tab: (active: boolean) => ({
      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer",
      background: active ? "#3b82f6" : "#f1f5f9", color: active ? "#fff" : "#64748b", transition: "all .2s"
    }),

    // Bottom Row
    bottomRow: { display: "grid", gap: 14 },
    table: { width: "100%", borderCollapse: "collapse" as any, fontSize: 13 },
    th: { padding: "8px 14px", textAlign: "left" as any, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as any, color: "#94a3b8", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
    td: { padding: "11px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
    badge: (bg: string, color: string) => ({ background: bg, color: color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }),

    // Right Panel — Activity
    actHead: { padding: "16px 18px 12px", borderBottom: "1px solid #f1f5f9", position: "sticky" as any, top: 0, background: "#fff", zIndex: 10 },
    actTitle: { fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as any, color: "#64748b", display: "flex", alignItems: "center", gap: 8 },
    actDot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.25)", animation: "pulse 2s infinite" },
    actItem: (i: number) => ({
      padding: "12px 16px",
      borderBottom: "1px solid #f8fafc",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      background: i % 2 === 0 ? "#fff" : "#fafbfc",
      transition: "background 0.2s",
    }),
    actAvatar: (color: string) => ({
      width: 36, height: 36, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0
    }),
    actName: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
    actEmail: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
    actDetail: { fontSize: 11, color: "#64748b", marginTop: 3, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as any },
    actTime: { fontSize: 10, color: "#cbd5e1", fontFamily: "monospace", marginTop: 4 },

    // Country table
    flagCircle: { width: 34, height: 34, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
    seoBar: () => ({
      width: "100%", height: 5, borderRadius: 99, background: "#f1f5f9", position: "relative" as any, overflow: "hidden"
    }),
    seoFill: (pct: number) => ({ position: "absolute" as any, top: 0, left: 0, height: "100%", width: `${pct}%`, borderRadius: 99, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", transition: "width 1s" }),
  };

  const avatarColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#f97316"];

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .stat-card:hover { transform: translateY(-3px); }
        .act-item:hover { background: #f0f9ff !important; }
      `}</style>

      {/* Header */}
      <header style={s.header}>
        <span style={s.headerTitle}>Analytics</span>
        <nav style={s.breadcrumb}>
          <a href="#" style={s.breadLink}>Home</a> ~
          <a href="#" style={s.breadLink}>Dashboard</a> ~
          <span>Analytics</span>
        </nav>
      </header>

      <div style={s.main}>
        {/* ── LEFT PANEL ── */}
        <div style={s.leftPanel}>

          {/* Stat Cards */}
          <div style={s.statsGrid}>
            {statCards.map((c, i) => (
              <div key={i} className="stat-card" style={s.statCard(c.color, c.shadow)}>
                {/* <button style={s.moreBtn}>⋮</button> */}
                <p style={s.statVal}>{c.value}</p>
                <p style={s.statLabel}>{c.label}</p>
                <div style={s.sparkWrap}>
                  <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ width: "100%", height: "100%", stroke: "#fff", fill: "none", strokeWidth: 2.5, strokeLinecap: "round" }}>
                    <path d={sparkPaths[i]} />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={s.chartRow}>
            {/* Enrollment Bar Chart (Replacing visitorData) */}
            <div style={s.card}>
              <div style={s.cardHead}>
                <span style={s.cardTitle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2.5}><path d="M3 3h18v18H3z" strokeLinejoin="round" /></svg>
                  Enrollment Telemetry
                </span>
                <div style={s.tabRow}>
                  {["monthly", "weekly"].map(t => (
                    <button key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
                      {t === "monthly" ? "📅 Monthly" : "Weekly"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.cardBody}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={enrollmentData} barGap={2} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} stroke="none" dy={8} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} stroke="none" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Area Chart */}
            <div style={s.card}>
              <div style={s.cardHead}>
                <span style={s.cardTitle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                  Financial Trajectory
                </span>
              </div>
              <div style={s.cardBody}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} stroke="none" dy={8} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} stroke="none" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#rev)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Top Courses + Country Keywords */}
          <div style={s.bottomRow}>
            {/* Top Courses */}
            <div style={s.card}>
              <div style={s.cardHead}>
                <span style={s.cardTitle}>
                  🏆 Top Yielding Courses
                </span>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Course</th>
                    <th style={{ ...s.th, textAlign: "center" }}>Price</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((c, i) => (
                    <tr key={c.id || i} style={{ cursor: "default" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={s.td}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#3b82f6" }}>{c.title}</span>
                      </td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <span style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>₹{(Number(c.price) || 0).toLocaleString()}</span>
                      </td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 800, fontSize: 13 }}>
                        {c._count?.enrollments || 0}
                      </td>
                    </tr>
                  ))}
                  {topCourses.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: "16px", textAlign: "center", color: "#94a3b8" }}>No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>


          </div>
        </div>

        {/* ── RIGHT PANEL — Activity Logs ── */}
        {/* <div style={s.rightPanel}>
          <div style={s.actHead}>
            <div style={s.actTitle}>
              <div style={s.actDot} />
              Real-time Activity Logs
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
              {activities.length} events · Last updated just now
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {activities.map((log, i) => {
              const cfg = badgeConfig[log.action] || badgeConfig.default;
              const initials = log.user?.name ? log.user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2) : "??";
              const detail = log.details?.courseTitle || log.details?.message || "User interaction recorded";
              return (
                <div key={log.id} className="act-item" style={s.actItem(i)}>
                  <div style={s.actAvatar(avatarColors[i % avatarColors.length])}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                      <span style={s.actName}>{log.user?.name}</span>
                      <span style={s.badge(cfg.bg, cfg.color)}>{cfg.label}</span>
                    </div>
                    <div style={s.actEmail}>{log.user?.email}</div>
                    <div style={s.actDetail}>{detail}</div>
                    <div style={s.actTime}>{format(new Date(log.createdAt), "HH:mm:ss · MMM d")}</div>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                No activity logs available.
              </div>
            )}
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", position: "sticky", bottom: 0 }}>
            <button style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#3b82f6", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.04em" }}>
              View All Logs →
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
