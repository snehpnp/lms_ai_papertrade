import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Play, CheckCircle2, Circle, Clock, ArrowLeft,
  BookOpen, FileText, Lock, Star, MessageSquare,
  User, CreditCard, Gift, Loader2, Sparkles, Send, Bot, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import userCourseService, { CourseModule, LessonItem, UserCourse, ExerciseItem, CourseReviewsResponse, ChatMessage } from "@/services/user.course.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Mascot from "@/components/common/Mascot";

interface ActiveLesson extends LessonItem {
  moduleTitle?: string;
}

const CourseDetail = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState<UserCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showEnrollMascot, setShowEnrollMascot] = useState(false);
  const [showCompletionMascot, setShowCompletionMascot] = useState(false);

  useEffect(() => {
    if (courseId) init();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [courseId]);

  useEffect(() => {
    if (location.state?.justEnrolled) {
      setShowEnrollMascot(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const init = async () => {
    try {
      setLoading(true);
      // Load basic course info first to get enrollment status early
      const courses = await userCourseService.getCourses();
      const found = courses.find(c => c.id === courseId!);

      if (found) {
        setCourse(found);
        if (found.isEnrolled) {
          setIsEnrolled(true);
          setEnrollmentId(found.enrollmentId);
        }
      }

      // Then load lessons (which also reports isEnrolled)
      await loadLessons();

    } catch (error) {
      console.error("Init error:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    if (!courseId) return;
    try {
      const { modules: mods, isEnrolled: enrolledStatus, enrollmentId: eid } = await userCourseService.getLessons(courseId);
      setModules(mods);

      if (eid) {
        setEnrollmentId(eid);
        // If we just got the enrollment ID, fetch enrollments to get progress
        const enrollments = await userCourseService.getEnrollments();
        const thisEnrollment = enrollments.find(e => e.id === eid);
        if (thisEnrollment) {
          const done = new Set(thisEnrollment.progress.map(p => p.lessonId));
          setCompletedIds(done);
        }
      }

      // If server reports enrolled in getLessons, update our state
      if (enrolledStatus) {
        setIsEnrolled(true);
      }

      // Set first lesson as active
      if (!activeLesson && mods[0]?.lessons[0]) {
        const first = mods[0].lessons[0];
        setActiveLesson({ ...first, moduleTitle: mods[0].title });
        if (enrolledStatus || isEnrolled) startTimer();
      }

    } catch (e: any) {
      console.error("Load lessons error:", e);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    if (Number(course.price) > 0) {
      navigate(`/user/payment/${course.id}`, { state: { courseId: course.id, amount: course.price, title: course.title } });
      return;
    }
    try {
      setEnrolling(true);
      await userCourseService.enroll(course.id);
      toast.success(`Welcome! You are now enrolled.`);
      await loadLessons();
      setShowEnrollMascot(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const startTimer = () => {
    setTimeSpent(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeSpent(t => t + 1), 1000);
  };

  const allLessons = modules.flatMap(m => m.lessons);

  const switchLesson = (lesson: LessonItem, moduleTitle: string) => {
    if (!isEnrolled) {
      toast.info("Please enroll to access this lesson content");
      return;
    }

    // Sequence Check for Switching
    const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIdx > 0) {
      const prevLesson = allLessons[currentIdx - 1];
      if (!completedIds.has(prevLesson.id)) {
        toast.error(`Please complete "${prevLesson.title}" first to move forward!`);
        return;
      }
    }

    // Record time on previous lesson before switching
    if (activeLesson && enrollmentId) {
      userCourseService.recordProgress(activeLesson.id, enrollmentId, timeSpent).catch(() => { });
    }
    setActiveLesson({ ...lesson, moduleTitle });
    startTimer();
  };

  const markComplete = async () => {
    if (!activeLesson || !enrollmentId) return;

    // Strict Sequence Check for Marking Complete
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIdx > 0) {
      const prevLesson = allLessons[currentIdx - 1];
      if (!completedIds.has(prevLesson.id)) {
        toast.error(`Error: Finish "${prevLesson.title}" before completing this one!`);
        return;
      }
    }

    try {
      await userCourseService.recordProgress(activeLesson.id, enrollmentId, timeSpent);
      setCompletedIds(prev => {
        const next = new Set([...prev, activeLesson.id]);
        if (next.size === totalLessons && totalLessons > 0 && !prev.has(activeLesson.id)) {
          setShowCompletionMascot(true);
        }
        return next;
      });
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

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        to={`/${user?.role}/courses`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* LEFT — Player / Overview */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!isEnrolled ? (
            <div className="space-y-6">
              {/* Course Banner Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-md group">
                {course?.thumbnail ? (
                  <img src={course.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 md:w-20 md:h-20 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 md:bg-black/40 flex flex-col items-center justify-center text-white p-4 md:p-6 text-center backdrop-blur-[1px]">
                  <div className="bg-primary/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 mb-3 md:mb-4 border border-white/20">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Enrich Your Skills</span>
                  </div>
                  <h1 className="text-xl md:text-3xl font-bold mb-3 drop-shadow-md line-clamp-2 px-2">{course?.title}</h1>
                  <div className="flex gap-4 items-center scale-90 md:scale-100">
                    <Button
                      onClick={handleEnroll}
                      size="lg"
                      disabled={enrolling}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 md:px-8 shadow-xl hover:shadow-primary/20 transition-all font-bold text-sm"
                    >
                      {enrolling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : Number(course?.price) > 0 ? <CreditCard className="w-4 h-4 mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                      {Number(course?.price) > 0 ? `Buy for ₹${Number(course?.price).toLocaleString()}` : "Enroll for Free"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description & Detail */}
              <Card className="p-4 md:p-6 border-border">
                <h3 className="text-base md:text-lg font-bold flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  About this course
                </h3>
                <div className="my-prose text-sm md:text-base text-muted-foreground leading-relaxed">
                  {course?.description || "No description provided for this course."}
                </div>
              </Card>
            </div>
          ) : (
            <>
              {activeLesson?.videoUrl ? (
                <div
                  className="sticky top-0 z-30 md:relative rounded-xl overflow-hidden border border-border bg-black aspect-video shadow-lg group select-none transition-all duration-300 ring-4 ring-background"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Watermark Overlay (Anti-Screen Record) */}
                  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-[0.03] select-none">
                    <div className="absolute top-1/4 left-1/4 transform -rotate-12 whitespace-nowrap text-white font-bold text-2xl">
                      {user?.email} {user?.id?.slice(0, 8)}
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 transform -rotate-12 whitespace-nowrap text-white font-bold text-2xl">
                      {user?.email} {user?.id?.slice(0, 8)}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-12 whitespace-nowrap text-white font-bold text-3xl animate-pulse">
                      {user?.email}
                    </div>
                  </div>

                  {/* Anti-Download Overlay (Invisible glass) */}
                  <div className="absolute inset-0 z-20 pointer-events-none bg-transparent" />

                  {activeLesson.videoUrl.includes("youtube.com") || activeLesson.videoUrl.includes("youtu.be") || activeLesson.videoUrl.includes("vimeo.com") ? (
                    <iframe
                      src={activeLesson.videoUrl.includes("youtube.com") || activeLesson.videoUrl.includes("youtu.be")
                        ? activeLesson.videoUrl.replace("watch?v=", "embed/").split("&")[0] + "?rel=0&modestbranding=1&controls=1"
                        : activeLesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={activeLesson.videoUrl}
                      src={activeLesson.videoUrl}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : activeLesson?.thumbnail ? (
                <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video shadow-lg">
                  <img src={activeLesson.thumbnail} className="w-full h-full object-cover" alt={activeLesson.title} />
                </div>
              ) : (
                <div className="rounded-xl aspect-video bg-sidebar flex flex-col items-center justify-center border border-border shadow-inner">
                  <Play className="w-14 h-14 text-primary/40 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    {activeLesson ? "No video for this lesson" : "Select a lesson"}
                  </p>
                </div>
              )}

              {activeLesson && (
                <div className="mt-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-6 bg-muted/30 p-1 flex w-full overflow-x-auto h-auto no-scrollbar justify-start border-b border-border/50 rounded-none">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0">Overview</TabsTrigger>
                      {activeLesson.exercises?.length > 0 && (
                        <TabsTrigger value="exercises" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0">
                          Exercises ({activeLesson.exercises.length})
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0">Reviews</TabsTrigger>
                      <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> AI Assistant
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="p-4 md:p-5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div>
                            <p className="text-[9px] text-primary bg-primary/10 rounded px-2 py-0.5 w-fit uppercase font-bold tracking-wider mb-2">
                              {activeLesson.moduleTitle}
                            </p>
                            <h1 className="text-lg md:text-xl font-bold text-foreground mb-4">{activeLesson.title}</h1>
                          </div>
                          {activeLesson.pdfUrl && (
                            <a
                              href={activeLesson.pdfUrl.includes("cloudinary.com") ? activeLesson.pdfUrl.replace("/upload/", "/upload/fl_attachment/") : activeLesson.pdfUrl}
                              download={`${activeLesson.title.replace(/\s+/g, "_")}.pdf`}
                              target="_self"
                              rel="noopener noreferrer"
                              className="w-full md:w-auto bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 md:py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center md:justify-start gap-1.5 transition-colors"
                            >
                              <FileText className="w-4 h-4" /> PDF Notes
                            </a>
                          )}
                        </div>

                        {activeLesson.content && (
                          <div className="mt-4 text-[13px] md:text-sm text-foreground my-prose border-t border-border pt-6" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        )}

                        <button
                          onClick={markComplete}
                          disabled={completedIds.has(activeLesson.id)}
                          className={cn(
                            "w-full mt-6 py-3 md:py-3.5 rounded-xl text-sm font-bold transition-all shadow-md",
                            completedIds.has(activeLesson.id)
                              ? "bg-green-500/10 text-green-600 border border-green-500/30 cursor-default"
                              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 shadow-primary/20"
                          )}
                        >
                          {completedIds.has(activeLesson.id) ? "✓ Completed" : "Mark as Complete"}
                        </button>
                      </div>
                    </TabsContent>

                    {activeLesson.exercises?.length > 0 && (
                      <TabsContent value="exercises">
                        <LessonExercises
                          lessonId={activeLesson.id}
                          exercises={activeLesson.exercises}
                          enrollmentId={enrollmentId!}
                        />
                      </TabsContent>
                    )}

                    <TabsContent value="reviews">
                      <CourseReviewsBlock courseId={courseId!} enrollmentId={enrollmentId!} />
                    </TabsContent>

                    <TabsContent value="ai">
                      <CourseChatBlock courseId={courseId!} />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT — Course Structure */}
        <div className="lg:col-span-4 space-y-5">
          {/* Progress Header */}
          {isEnrolled && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm border-l-4 border-l-primary">
              <h3 className="font-bold text-sm mb-1">{course?.title}</h3>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground font-medium">
                    {completedCount} of {totalLessons} done
                  </span>
                  <span className="text-primary font-bold">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>
            </div>
          )}

          {!isEnrolled && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-sm">Course is Locked</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Enroll to start watching lessons and take exercises.</p>
              <Button onClick={handleEnroll} size="sm" className="w-full rounded-full" disabled={enrolling}>
                {Number(course?.price) > 0 ? "Enroll Now" : "Enroll for Free"}
              </Button>
            </div>
          )}

          {/* Modules Accordion */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/20">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">Course Curriculum</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {totalLessons} lessons
              </span>
            </div>

            {modules.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground italic">
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
                    <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline font-semibold text-foreground/80">
                      <div className="flex items-center gap-2 text-left">
                        <span>{mod.title}</span>
                        <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                          {mod.lessons.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1">
                      <ul className="space-y-0.5">
                        {mod.lessons.map((lesson) => {
                          const done = completedIds.has(lesson.id);
                          const isActive = activeLesson?.id === lesson.id;

                          // Sequential Lock Logic
                          const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                          const isLocked = isEnrolled && globalIdx > 0 && !completedIds.has(allLessons[globalIdx - 1].id);

                          return (
                            <li key={lesson.id}>
                              <button
                                onClick={() => switchLesson(lesson, mod.title)}
                                disabled={!isEnrolled || isLocked}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-xs transition-all border-l-2",
                                  isActive
                                    ? "bg-primary/10 text-primary font-black border-l-primary shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.05)]"
                                    : "hover:bg-muted text-muted-foreground border-l-transparent",
                                  (!isEnrolled || isLocked) && "cursor-not-allowed opacity-40 grayscale"
                                )}
                              >
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                ) : (isLocked || !isEnrolled) ? (
                                  <Lock className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                                )}
                                <span className={cn("flex-1 truncate", isActive && "whitespace-normal")}>{lesson.title}</span>
                                {lesson.duration && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                                    <Clock className="w-2.5 h-2.5" />
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

          {/* Reviews Preview if not enrolled */}
          {!isEnrolled && (
            <div className="space-y-4">
              <CourseReviewsBlock courseId={courseId!} enrollmentId={enrollmentId!} />
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Success Mascot Modal */}
      <Dialog open={showEnrollMascot} onOpenChange={setShowEnrollMascot}>
        <DialogContent className="sm:max-w-md text-center flex flex-col items-center justify-center p-8 bg-black/95 border-primary/30">
          <Mascot pose="explaining" size={200} />
          <h2 className="text-2xl font-bold text-white mt-4">Welcome to the Course!</h2>
          <p className="text-white/70 mt-2 mb-6 text-sm">Your AI Mentor is ready. Let's start learning.</p>
          <Button onClick={() => setShowEnrollMascot(false)} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Let's Go</Button>
        </DialogContent>
      </Dialog>

      {/* Course Completion Celebration Mascot Modal */}
      <Dialog open={showCompletionMascot} onOpenChange={setShowCompletionMascot}>
        <DialogContent className="sm:max-w-md text-center flex flex-col items-center justify-center p-8 bg-black/95 border-green-500/30">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
            <Mascot pose="celebration" size={220} className="scale-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] relative z-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mt-6 mb-2">Congratulations!</h2>
          <p className="text-green-400 font-medium mb-6 text-sm">You've successfully completed this course.</p>
          <Button onClick={() => setShowCompletionMascot(false)} className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20">Keep Learning</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function LessonExercises({ exercises, enrollmentId }: { lessonId: string, exercises: ExerciseItem[], enrollmentId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { isCorrect: boolean, score: number }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Scroll to exercises on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById('exercise-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Restart when exercises change
  useEffect(() => {
    setCurrentIdx(0);
    setShowCelebration(false);
    setAnswers({});
    setFeedback({});
  }, [exercises]);

  const sortedExercises = [...exercises].sort((a, b) => a.order - b.order);
  const ex = sortedExercises[currentIdx];
  const fb = ex ? feedback[ex.id] : null;

  const handleSubmit = async (exercise: ExerciseItem) => {


    if (!answers[exercise.id]) {
      toast.error("Please enter an answer first");
      return;
    }
    try {
      setSubmitting(exercise.id);
      const result = await userCourseService.submitExercise(exercise.id, enrollmentId, answers[exercise.id]);

      setFeedback(prev => ({ ...prev, [exercise.id]: result }));

      if (result.isCorrect) {
        toast.success("Correct answer!");
        if (currentIdx === sortedExercises.length - 1) {
          setShowCelebration(true);
        }
      } else {
        toast.error("Incorrect answer. Try again.");
      }
    } catch (e) {
      toast.error("Failed to submit answer");
    } finally {
      setSubmitting(null);
    }
  };

  const handleNext = () => {
    if (currentIdx < sortedExercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  if (!ex) return null;

  return (
    <div id="exercise-section" className="space-y-6 mt-4 animate-fade-in relative block text-center md:text-left scroll-mt-64">
      {/* Exercise Mascot Assistant */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6">
        <div className="shrink-0 flex items-center justify-center p-2 bg-primary/5 rounded-full border border-primary/10">
          <Mascot
            pose={fb?.isCorrect ? (currentIdx === sortedExercises.length - 1 ? 'celebration' : 'encouraging') : 'thinking'}
            size={110}
            className={cn("transition-all duration-300 md:w-[100px] md:h-[100px]")}
          />
        </div>
        <div className="flex-1 bg-primary/10 border border-primary/20 rounded-2xl p-4 md:p-5 relative shadow-sm">
          {/* Pointer for Mobile (Top) */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/10 border-l border-t border-primary/20 transform rotate-45 md:hidden" />
          {/* Pointer for Desktop (Left) */}
          <div className="absolute top-1/2 -left-2 w-4 h-4 bg-primary/10 border-l border-b border-primary/20 transform -translate-y-1/2 rotate-45 hidden md:block" />

          <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <h4 className="font-black text-primary text-[10px] uppercase tracking-widest">AI Mentor Guidance</h4>
          </div>
          <p className="text-foreground/80 text-xs md:text-sm font-medium leading-relaxed">
            {fb?.isCorrect
              ? (currentIdx === sortedExercises.length - 1 ? "Incredible job! You've mastered all exercises here!" : "Spot on! Great work. Ready for the next one?")
              : `Focus closely! This is question ${currentIdx + 1} of ${sortedExercises.length}. You got this!`}
          </p>
        </div>
      </div>

      <div key={ex.id} className="p-5 md:p-8 bg-card border border-border rounded-2xl space-y-6 shadow-md transition-all">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 border-b border-border/50 pb-3">
          <span className="flex items-center gap-2">
            <Target className="w-3 h-3" /> Challenge Mode
          </span>
          <span className="bg-muted px-2 py-0.5 rounded-full">{currentIdx + 1} / {sortedExercises.length}</span>
        </div>

        <h3 className="font-semibold text-foreground text-base md:text-lg">
          {ex.question}
        </h3>

        {ex.type === 'MCQ' && ex.options && (
          <RadioGroup
            value={answers[ex.id] || ""}
            onValueChange={(val) => setAnswers(prev => ({ ...prev, [ex.id]: val }))}
            className="space-y-3 mt-4"
          >
            {ex.options.map((opt, optIndex) => {
              const optionValue = (optIndex).toString();
              const isSelected = answers[ex.id] === optionValue;

              return (
                <div
                  key={opt.id || optIndex}
                  className={cn(
                    "flex items-center space-x-3 p-3 border rounded-lg transition-all cursor-pointer",
                    isSelected ? "bg-primary/10 border-primary" : "border-border hover:bg-muted/50",
                    fb?.isCorrect ? "opacity-75 pointer-events-none" : ""
                  )}
                  onClick={() => { if (!fb?.isCorrect) setAnswers(prev => ({ ...prev, [ex.id]: optionValue })) }}
                >
                  <RadioGroupItem value={optionValue} id={`opt-${ex.id}-${optIndex}`} checked={isSelected} />
                  <Label htmlFor={`opt-${ex.id}-${optIndex}`} className="text-sm font-medium text-foreground cursor-pointer flex-1">
                    {opt.text}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}

        {ex.type === 'FILL_IN_BLANKS' && (
          <Input
            value={answers[ex.id] || ""}
            onChange={(e) => setAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
            placeholder="Type your answer here..."
            disabled={!!fb?.isCorrect}
            className="mt-4 max-w-sm h-12 text-base"
          />
        )}

        <div className="flex flex-col md:flex-row items-center gap-4 mt-6 pt-6 border-t border-border/50">
          {!fb?.isCorrect ? (
            <button
              onClick={() => handleSubmit(ex)}
              disabled={submitting === ex.id}
              className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20"
            >
              {submitting === ex.id ? "Checking..." : "Submit Answer"}
            </button>
          ) : (
            currentIdx < sortedExercises.length - 1 && (
              <button
                onClick={handleNext}
                className="w-full md:w-auto px-8 py-3 bg-green-500 text-white hover:bg-green-600 hover:scale-105 font-bold rounded-xl text-sm transition-all shadow-md shadow-green-500/20"
              >
                Next Question →
              </button>
            )
          )}

          {fb && (
            <div className={cn("text-sm font-bold flex items-center gap-2", fb.isCorrect ? "text-green-500" : "text-red-500")}>
              {fb.isCorrect
                ? <><CheckCircle2 className="w-5 h-5" /> Correct! Outstanding answer.</>
                : <><Circle className="w-5 h-5 text-red-500" /> Incorrect. Don't give up, try again!</>}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md text-center flex flex-col items-center justify-center p-8 bg-black/95 border-amber-500/30">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
            <Mascot pose="celebration" size={240} className="scale-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] relative z-10" />

            {/* Simple CSS Confetti Effects */}
            <div className="absolute top-0 right-10 w-3 h-10 bg-blue-500 rounded-full animate-ping delay-100" />
            <div className="absolute bottom-10 left-10 w-4 h-4 bg-pink-500 rounded-sm animate-ping delay-300" />
            <div className="absolute top-10 left-5 w-5 h-5 bg-green-500 rounded-full animate-bounce delay-200" />
          </div>

          <h2 className="text-3xl font-black text-amber-400 mt-8 mb-2">Flawless Victory!</h2>
          <p className="text-white font-medium mb-6 text-sm">All exercises solved perfectly. Your AI Mentor is proud!</p>
          <Button onClick={() => setShowCelebration(false)} className="rounded-full px-10 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-xl shadow-amber-600/30 border-none">
            Continue Course
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CourseReviewsBlock({ courseId, enrollmentId }: { courseId: string; enrollmentId: string | null }) {
  const [reviewsData, setReviewsData] = useState<CourseReviewsResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
    // Scroll to section
    const timer = setTimeout(() => {
      const element = document.getElementById('reviews-section');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, [courseId]);

  const loadReviews = async () => {
    try {
      const data = await userCourseService.getCourseReviews(courseId);
      setReviewsData(data);
    } catch {
      // toast.error("Failed to load reviews");
    }
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please provide a valid rating between 1 and 5");
      return;
    }
    try {
      setSubmitting(true);
      await userCourseService.submitCourseReview(courseId, rating, comment);
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      loadReviews();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reviews-section" className="space-y-6 mt-4 scroll-mt-64">
      {/* Submit Review Box */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> Write a Review
        </h3>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={cn("p-1 transition-colors", star <= rating ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500/50")}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Your Comment (Optional)</Label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Tell others what you think about this course..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !enrollmentId}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-medium disabled:opacity-50 transition"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-lg text-foreground">User Reviews</h3>
          {reviewsData && reviewsData.totalReviews > 0 && (
            <div className="flex items-center gap-1 ml-4 text-sm font-medium text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-current" />
              {Number(reviewsData.averageRating).toFixed(1)} <span className="text-muted-foreground text-xs font-normal">({reviewsData.totalReviews})</span>
            </div>
          )}
        </div>

        {(!reviewsData || reviewsData.reviews.length === 0) ? (
          <div className="text-center py-10 bg-muted/10 border border-border/50 rounded-xl">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsData.reviews.map((review) => (
              <div key={review.id} className="p-4 bg-card border border-border/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {review.user.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{review.user.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "fill-current" : "text-muted-foreground/20")} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground/80 mt-2 p-3 bg-muted/30 rounded-lg">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseChatBlock({ courseId }: { courseId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();
    // Scroll to section
    const timer = setTimeout(() => {
      const element = document.getElementById('chat-section');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, [courseId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChat = async () => {
    try {
      const chat = await userCourseService.getCourseChat(courseId);
      setMessages(chat);
    } catch (e) {
      console.error("Failed to load chat", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setLoading(true);

    // Optimistic UI
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMsg, createdAt: new Date().toISOString() }]);

    try {
      const res = await userCourseService.sendCourseMessage(courseId, userMsg);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempId);
        return [...filtered, res];
      });
    } catch (e) {
      toast.error("Failed to get AI response");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="chat-section" className="flex flex-col h-[500px] bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 scroll-mt-64">
      <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm">Course AI Assistant</h3>
        </div>
        <span className="text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full text-primary">Knowledge-Powered</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-60">
            <Sparkles className="w-10 h-10 text-primary mb-2" />
            <p className="text-sm font-medium">Ask anything about this course!</p>
            <p className="text-[10px] max-w-[200px]">I know everything about the lessons, concepts, and topics covered here.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                m.role === 'user'
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground border border-border/50 rounded-bl-none"
              )}>
                {m.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {m.role === 'assistant' ? "Course AI" : "You"}
              </span>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-border bg-sidebar">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-background"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-2 text-center opacity-50 italic">AI results may be supplementary to official curriculum.</p>
      </div>
    </div>
  );
}

export default CourseDetail;
