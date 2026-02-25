import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, Circle, Clock, ArrowLeft, BookOpen, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import userCourseService, { CourseModule, LessonItem, UserCourse } from "@/services/user.course.service";

interface ActiveLesson extends LessonItem {
  moduleTitle?: string;
}

const CourseDetail = () => {
  const { id: courseId } = useParams<{ id: string }>();

  const [course, setCourse] = useState<UserCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);


  useEffect(() => {
    if (courseId) init();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [courseId]);

  const init = async () => {
    try {
      setLoading(true);
      // Get courses list to find enrollment status
      const courses = await userCourseService.getCourses();

      const found = courses.find(c => c.id === courseId!);

      if (found) {
        setCourse(found);
        if (found.isEnrolled && found.enrollmentId) {
          setEnrollmentId(found.enrollmentId);
          await loadLessons();
        } else {
          setNotEnrolled(true);
        }
      }
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    if (!courseId) return;
    try {
      const { modules: mods } = await userCourseService.getLessons(courseId);
      setModules(mods);


      // Set first lesson as active
      const firstLesson = mods[0]?.lessons[0];
      if (firstLesson) {
        setActiveLesson({ ...firstLesson, moduleTitle: mods[0].title });
        startTimer();
      }

      // Load my enrollments to get completed lessons
      const enrollments = await userCourseService.getEnrollments();
    
      const thisEnrollment = enrollments.find(e => e.courseId === courseId);
      if (thisEnrollment) {
        setEnrollmentId(thisEnrollment.id);
        const done = new Set(thisEnrollment.progress.map(p => p.lessonId));
        setCompletedIds(done);
      }
    } catch (e: any) {
      if (e?.response?.status === 403) setNotEnrolled(true);
    }
  };

  const startTimer = () => {
    setTimeSpent(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeSpent(t => t + 1), 1000);
  };

  const switchLesson = (lesson: LessonItem, moduleTitle: string) => {
    // Record time on previous lesson before switching
    if (activeLesson && enrollmentId) {
      userCourseService.recordProgress(activeLesson.id, enrollmentId, timeSpent).catch(() => { });
    }
    setActiveLesson({ ...lesson, moduleTitle });
    startTimer();
  };

  const markComplete = async () => {
    if (!activeLesson || !enrollmentId) return;
    try {
      await userCourseService.recordProgress(activeLesson.id, enrollmentId, timeSpent);
      setCompletedIds(prev => new Set([...prev, activeLesson.id]));
      toast.success("Lesson marked as complete!");
      setTimeSpent(0);
    } catch {
      toast.error("Failed to mark complete");
    }
  };

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedCount = completedIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="aspect-video bg-muted rounded-xl animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-40 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center">
        <Lock className="w-14 h-14 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg mb-2">Not Enrolled</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You need to enroll in this course to access its content.
        </p>
        <Link
          to="/user/courses"
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        to="/user/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Player */}
        <div>
          {activeLesson?.videoUrl ? (
            <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video">
              <iframe
                src={activeLesson.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-xl aspect-video bg-sidebar flex flex-col items-center justify-center border border-border">
              <Play className="w-14 h-14 text-primary/40 mb-2" />
              <p className="text-muted-foreground text-sm">
                {activeLesson ? "No video for this lesson" : "Select a lesson"}
              </p>
            </div>
          )}

          {activeLesson && (
            <div className="mt-4 p-4 bg-card border border-border rounded-xl space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {activeLesson.moduleTitle}
              </p>
              <h2 className="text-foreground">{activeLesson.title}</h2>
              {activeLesson.pdfUrl && (
                <a
                  href={activeLesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" /> Download PDF
                </a>
              )}
              <button
                onClick={markComplete}
                disabled={completedIds.has(activeLesson.id)}
                className={cn(
                  "w-full mt-2 py-2.5 rounded-lg text-sm  transition",
                  completedIds.has(activeLesson.id)
                    ? "bg-green-500/10 text-green-600 border border-green-500/30 cursor-default"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {completedIds.has(activeLesson.id) ? "✓ Completed" : "Mark as Complete"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Course Structure */}
        <div>
          {/* Progress Header */}
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h2 className="text-foreground">{course?.title}</h2>
            {course?.subadmin && (
              <p className="text-xs text-muted-foreground mt-0.5">by {course.subadmin.name}</p>
            )}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">
                  {completedCount}/{totalLessons} lessons completed
                </span>
                <span className="text-primary">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </div>

          {/* Modules Accordion */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm">Course Content</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {totalLessons} lessons
              </span>
            </div>

            {modules.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No lessons yet
              </div>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={modules.map(m => m.id)}
                className="px-2 py-1"
              >
                {modules.map((mod) => (
                  <AccordionItem key={mod.id} value={mod.id} className="border-0">
                    <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        <span>{mod.title}</span>
                        <span className="text-xs text-muted-foreground">
                          ({mod.lessons.length} lessons)
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1">
                      <ul className="space-y-0.5">
                        {mod.lessons.map((lesson) => {
                          const done = completedIds.has(lesson.id);
                          const isActive = activeLesson?.id === lesson.id;
                          return (
                            <li key={lesson.id}>
                              <button
                                onClick={() => switchLesson(lesson, mod.title)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted text-foreground"
                                )}
                              >
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className="flex-1 truncate">{lesson.title}</span>
                                {lesson.duration && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration}m
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
