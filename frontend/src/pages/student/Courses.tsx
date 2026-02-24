import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { BookOpen, Users, Lock, Gift, Search } from "lucide-react";
import { toast } from "sonner";
import userCourseService, { UserCourse } from "@/services/user.course.service";

const StudentCourses = () => {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await userCourseService.getCourses();
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course: UserCourse) => {
    if (course.isEnrolled) return;
    if (Number(course.price) > 0) {
      // For paid courses, redirect to payment (placeholder)
      toast.info("Payment integration coming soon!");
      return;
    }
    try {
      setEnrolling(course.id);
      await userCourseService.enroll(course.id);
      toast.success(`Enrolled in "${course.title}"!`);
      fetchCourses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses?.filter((c) =>
    c?.title?.toLowerCase()?.includes(search?.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="My Courses" subtitle="Browse courses available to you" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Courses" subtitle={`${courses.length} courses available to you`} />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No courses found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course) => {
          const isPaid = Number(course.price) > 0;
          const isEnrolled = course.isEnrolled;
          const isEnrollingNow = enrolling === course.id;

          return (
            <div
              key={course.id}
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <BookOpen className="w-10 h-10 text-primary/40" />
                )}
                {/* Price badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isPaid
                    ? "bg-amber-500 text-white"
                    : "bg-green-500 text-white"
                }`}>
                  {isPaid ? `₹${Number(course.price).toLocaleString()}` : "FREE"}
                </div>
                {/* Enrolled badge */}
                {isEnrolled && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    Enrolled
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{course.title}</h3>
                {course.subadmin && (
                  <p className="text-xs text-muted-foreground mt-1">by {course.subadmin.name}</p>
                )}
                {course.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course._count.modules} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course._count.enrollments} enrolled
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-4 pt-3 border-t border-border">
                  {isEnrolled ? (
                    <Link
                      to={`/user/course/${course.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                    >
                      Continue Learning →
                    </Link>
                  ) : isPaid ? (
                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={isEnrollingNow}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition disabled:opacity-60"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {isEnrollingNow ? "Processing..." : `Buy for ₹${Number(course.price).toLocaleString()}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={isEnrollingNow}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      {isEnrollingNow ? "Enrolling..." : "Enroll for Free"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentCourses;
