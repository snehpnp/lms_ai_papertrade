import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import PageHeader from "@/components/common/PageHeader";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import userCourseService, { Enrollment, UserCourse } from "@/services/user.course.service";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentsData, coursesData] = await Promise.all([
        userCourseService.getEnrollments(),
        userCourseService.getCourses(),
      ]);
      setEnrollments(enrollmentsData);
      setAvailableCourses(coursesData);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const totalLessonsCompleted = enrollments?.reduce((a, e) => a + e?.progress?.length, 0);
  const enrolledCount = enrollments?.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Student"}! 👋`}
        subtitle="Continue your learning journey"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Enrolled Courses" value={String(enrolledCount)} icon={BookOpen} />
        <StatCard
          title="Lessons Completed"
          value={String(totalLessonsCompleted)}
          icon={Trophy}
          iconColor="bg-profit/10 text-profit-foreground"
        />
        <StatCard
          title="Available Courses"
          value={String(availableCourses.length)}
          icon={Clock}
          iconColor="bg-accent/10 text-accent"
        />
        <StatCard
          title="Course Progress"
          value={enrolledCount > 0 ? `${Math.round((totalLessonsCompleted / Math.max(enrolledCount * 5, 1)) * 100)}%` : "0%"}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses Progress */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">My Enrolled Courses</h3>
            <Link
              to="/user/courses"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
              <Link
                to="/user/courses"
                className="inline-block mt-3 text-xs text-primary hover:underline"
              >
                Browse Courses →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 4).map((enrollment) => {
                const lessonsCompleted = enrollment.progress.length;
                // We don't have total lessons here without extra call, approximate
                const pct = Math.min(lessonsCompleted * 20, 100);

                return (
                  <Link
                    to={`/user/course/${enrollment.courseId}`}
                    key={enrollment.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{enrollment.course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lessonsCompleted} lessons completed
                      </p>
                      <Progress value={pct} className="mt-1.5 h-1.5" />
                    </div>
                    <span className="text-xs font-semibold text-primary shrink-0">{pct}%</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Courses to Explore */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Explore More Courses</h3>
            <Link
              to="/user/courses"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : availableCourses.filter(c => !c.isEnrolled).length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">You're enrolled in all available courses!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableCourses
                .filter(c => !c.isEnrolled)
                .slice(0, 4)
                .map(course => {
                  const isPaid = Number(course.price) > 0;
                  return (
                    <Link
                      to="/user/courses"
                      key={course.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {course._count.modules} modules
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isPaid
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {isPaid ? `₹${Number(course.price).toLocaleString()}` : "FREE"}
                      </span>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
