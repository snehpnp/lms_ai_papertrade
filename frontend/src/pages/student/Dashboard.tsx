import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import PageHeader from "@/components/common/PageHeader";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import userCourseService, { Enrollment, UserCourse } from "@/services/user.course.service";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStore } from "@/store/profileStore";
import { ExternalLink } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { userProfile, fetchProfile } = useProfileStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    fetchProfile();
  }, [fetchProfile]);

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

  const enrolledCourses = availableCourses.filter(c => c.isEnrolled);
  const enrolledCount = enrolledCourses.length;
  const totalLessonsCompleted = enrollments?.reduce((a, e) => a + (e?.progress?.length || 0), 0);

  const averageProgressPct = enrolledCount > 0
    ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progressPct || 0), 0) / enrolledCount)
    : 0;

  const completedCount = enrolledCourses.filter(c => c.progressPct === 100).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Student"}! 👋`}
        subtitle="Continue your learning journey"
        action={
          userProfile?.referredBy?.brokerRedirectUrl && (
            <a
              href={userProfile.referredBy.brokerRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] md:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 w-full md:w-auto"
            >
              <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
              CONNECT TO BROKER
            </a>
          )
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8">
        <StatCard title="Enrolled" value={String(enrolledCount)} icon={BookOpen} />
        <StatCard
          title="Lessons Done"
          value={String(totalLessonsCompleted)}
          icon={Trophy}
          iconColor="bg-profit/10 text-profit-foreground"
        />
        <StatCard
          title="Finished"
          value={String(completedCount)}
          icon={CheckCircle2}
          iconColor="bg-green-500/10 text-green-600"
        />
        <StatCard
          title="Overall"
          value={`${averageProgressPct}%`}
          icon={TrendingUp}
          iconColor="bg-primary/10 text-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses Progress */}
        <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm md:text-base font-bold text-foreground">My Courses</h3>
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
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((enrollment) => {
                const courseInfo = availableCourses.find(c => c.id === enrollment.courseId);
                const lessonsCompleted = enrollment.progress.length;
                const totalLessons = courseInfo?.totalLessons || courseInfo?._count?.lessons || 0;
                const pct = courseInfo?.progressPct ?? (totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0);

                return (
                  <Link
                    to={`/user/course/${enrollment.courseId}`}
                    key={enrollment.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[13px] md:text-sm font-bold truncate pr-2 group-hover:text-primary transition-colors">{enrollment.course.title}</p>
                        <span className="text-[9px] md:text-[10px] font-black text-primary shrink-0 bg-primary/5 px-2 py-0.5 rounded-full">{pct}%</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium">
                        {lessonsCompleted}/{totalLessons} lessons done
                      </p>
                      <Progress value={pct} className="mt-2 h-1 md:h-1.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Courses to Explore */}
        <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm md:text-base font-bold text-foreground">Explore More</h3>
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
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                    >
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] md:text-sm font-bold truncate group-hover:text-primary transition-colors">{course.title}</p>
                        <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium mt-0.5">
                          {course._count.modules} modules • By {course.subadmin?.name || "Expert"}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 shadow-sm ${isPaid
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
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
