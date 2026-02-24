import { useEffect, useState } from "react";
import { Users, TrendingUp, BarChart3, DollarSign, BookOpen, Activity, PlayCircle } from "lucide-react";
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
  Area,
  AreaChart,
} from "recharts";
import statsService from "@/services/stats.service";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

interface ActivityLog {
  id: string;
  action: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  details: any;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, rev, enr, act] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getRevenueChart(7),
        statsService.getEnrollmentChart(7),
        statsService.getRecentActivities(5)
      ]);
      setStats(s);
      setRevenueData(rev);
      setEnrollmentData(enr);
      setActivities(act);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'COURSE_ENROLLMENT':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-green-500/20">Purchased Course</Badge>;
      case 'LOGIN':
        return <Badge variant="outline">Login</Badge>;
      default:
        return <Badge variant="secondary">{action.replace('_', ' ')}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading dashboard analytics...</div>;
  }

  return (
    <div className="animate-fade-in">
      
      <PageHeader title="Admin Dashboard" subtitle="Real-time overview of your educational platform" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Students"
          value={stats?.totalUsers.toString() || "0"}
          icon={Users}
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses.toString() || "0"}
          icon={BookOpen}
          iconColor="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Enrollments"
          value={stats?.totalEnrollments.toString() || "0"}
          icon={PlayCircle}
          iconColor="bg-green-500/10 text-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue.toLocaleString() || "0"}`}
          icon={DollarSign}
          iconColor="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="ui-card p-6">
          <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-6">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "var(--shadow-lg)"
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--profit))" fill="url(#revenueGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="ui-card p-6">
          <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-6">Enrollment Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "var(--shadow-lg)"
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="ui-table-container">
        <div className="ui-header-panel">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-black text-card-foreground uppercase tracking-tight">Recent Activities</h3>
          </div>
          <button className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full" onClick={fetchData}>Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground font-medium italic">No recent activities found</td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground">{act.user.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{act.user.email}</span>
                      </div>
                    </td>
                    <td>
                      {getActionLabel(act.action)}
                    </td>
                    <td>
                      <span className="text-muted-foreground font-medium text-xs">
                        {act.details?.courseTitle || 'Generic activity'}
                      </span>
                    </td>
                    <td className="text-right font-black text-[10px] text-muted-foreground tabular-nums">
                      {format(new Date(act.createdAt), "MMM d, HH:mm")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
