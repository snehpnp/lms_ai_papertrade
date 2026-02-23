import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Star, Clock, BookOpen } from "lucide-react";

const courses = [
  {
    id: "1",
    title: "Forex Trading Fundamentals",
    instructor: "James Carter",
    rating: 4.8,
    thumbnail: "",
    progress: 72,
    lessons: 24,
    duration: "12h 30m",
  },
  {
    id: "2",
    title: "Technical Analysis Mastery",
    instructor: "Sarah Lee",
    rating: 4.6,
    thumbnail: "",
    progress: 45,
    lessons: 18,
    duration: "9h 15m",
  },
  {
    id: "3",
    title: "Risk Management Pro",
    instructor: "Mike Johnson",
    rating: 4.9,
    thumbnail: "",
    progress: 90,
    lessons: 12,
    duration: "6h 45m",
  },
  {
    id: "4",
    title: "Cryptocurrency Trading",
    instructor: "Alex Kim",
    rating: 4.5,
    thumbnail: "",
    progress: 10,
    lessons: 20,
    duration: "11h",
  },
  {
    id: "5",
    title: "Options & Derivatives",
    instructor: "Emily Wang",
    rating: 4.7,
    thumbnail: "",
    progress: 0,
    lessons: 16,
    duration: "8h 20m",
  },
  {
    id: "6",
    title: "Algorithmic Trading Basics",
    instructor: "David Park",
    rating: 4.4,
    thumbnail: "",
    progress: 30,
    lessons: 22,
    duration: "14h",
  },
];

const StudentCourses = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader title="My Courses" subtitle="Browse and continue your enrolled courses" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/student/course/${course.id}`}
            className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground truncate">{course.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>

              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {course.duration}
                </span>
              </div>

              {course.progress > 0 ? (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-primary">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              ) : (
                <p className="text-xs text-accent font-medium mt-3">Start Learning →</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
