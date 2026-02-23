import { BookOpen, Clock, Trophy, TrendingUp } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import PageHeader from "@/components/common/PageHeader";
import { Progress } from "@/components/ui/progress";

const enrolledCourses = [
  { title: "Forex Trading Fundamentals", progress: 72, lessons: 24, completed: 17 },
  { title: "Technical Analysis Mastery", progress: 45, lessons: 18, completed: 8 },
  { title: "Risk Management Pro", progress: 90, lessons: 12, completed: 11 },
];

const StudentDashboard = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader title="My Dashboard" subtitle="Welcome back! Continue your trading journey." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Enrolled Courses" value="5" icon={BookOpen} />
        <StatCard
          title="Completed Lessons"
          value="36"
          icon={Trophy}
          iconColor="bg-profit/10 text-profit-foreground"
        />
        <StatCard
          title="Hours Learned"
          value="48h"
          icon={Clock}
          iconColor="bg-accent/10 text-accent"
        />
        <StatCard
          title="Quiz Score Avg"
          value="87%"
          icon={TrendingUp}
          trend={{ value: "5% improvement", positive: true }}
        />
      </div>

      {/* Continue Learning */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-base font-semibold text-card-foreground mb-5">Continue Learning</h3>
        <div className="space-y-4">
          {enrolledCourses.map((course, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {course.completed}/{course.lessons} lessons
                </p>
                <Progress value={course.progress} className="mt-2 h-1.5" />
              </div>
              <span className="text-sm font-semibold text-primary">{course.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
