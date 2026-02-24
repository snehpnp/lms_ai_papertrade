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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-card-foreground mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-card-foreground mb-4">Enrollment Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-card-foreground">Recent Activities</h3>
          </div>
          <button className="text-sm text-primary hover:underline" onClick={fetchData}>Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground uppercase text-[10px]">User</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground uppercase text-[10px]">Action</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground uppercase text-[10px]">Details</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground uppercase text-[10px]">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No recent activities found</td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{act.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">{act.user.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {getActionLabel(act.action)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground italic truncate max-w-[300px]">
                      {act.details?.courseTitle || 'Generic activity'}
                    </td>
                    <td className="px-5 py-3 text-right text-xs">
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
