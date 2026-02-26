import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  User, CreditCard, Gift, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import userCourseService, { CourseModule, LessonItem, UserCourse, ExerciseItem, CourseReviewsResponse } from "@/services/user.course.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ActiveLesson extends LessonItem {
  moduleTitle?: string;
}

const CourseDetail = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (courseId) init();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [courseId]);

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
      const { modules: mods, isEnrolled: enrolledStatus } = await userCourseService.getLessons(courseId);
      setModules(mods);

      // If server reports enrolled in getLessons, update our state
      if (enrolledStatus) {
        setIsEnrolled(true);
        // Only fetch enrollments if we don't have enrollmentId yet
        if (!enrollmentId) {
          const enrollments = await userCourseService.getEnrollments();
          const thisEnrollment = enrollments.find(e => e.courseId === courseId);
          if (thisEnrollment) {
            setEnrollmentId(thisEnrollment.id);
            const done = new Set(thisEnrollment.progress.map(p => p.lessonId));
            setCompletedIds(done);
          }
        }
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

  const switchLesson = (lesson: LessonItem, moduleTitle: string) => {
    if (!isEnrolled) {
      toast.info("Please enroll to access this lesson content");
      return;
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

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        to="/user/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — Player / Overview */}
        <div className="lg:col-span-8">
          {!isEnrolled ? (
            <div className="space-y-6">
              {/* Course Banner Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-md group">
                {course?.thumbnail ? (
                  <img src={course.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-[2px]">
                  <div className="bg-primary/20 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 mb-4 border border-white/20">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-widest">Enrich Your Skills</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-3 drop-shadow-md">{course?.title}</h1>
                  <div className="flex gap-4 items-center">
                    <Button
                      onClick={handleEnroll}
                      size="lg"
                      disabled={enrolling}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 shadow-xl hover:shadow-primary/20 transition-all font-bold"
                    >
                      {enrolling ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : Number(course?.price) > 0 ? <CreditCard className="w-5 h-5 mr-2" /> : <Gift className="w-5 h-5 mr-2" />}
                      {Number(course?.price) > 0 ? `Buy Course for ₹${Number(course?.price).toLocaleString()}` : "Enroll for Free"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description & Detail */}
              <Card className="p-6 border-border">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  About this course
                </h3>
                <div className="my-prose text-muted-foreground leading-relaxed">
                  {course?.description || "No description provided for this course."}
                </div>
              </Card>
            </div>
          ) : (
            <>
              {activeLesson?.videoUrl ? (
                <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video shadow-lg">
                  <iframe
                    src={activeLesson.videoUrl.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
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
                    <TabsList className="mb-4 bg-muted/50 p-1 flex-wrap h-auto">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-card px-4 py-2">Overview</TabsTrigger>
                      {activeLesson.exercises?.length > 0 && (
                        <TabsTrigger value="exercises" className="data-[state=active]:bg-card px-4 py-2">
                          Exercises ({activeLesson.exercises.length})
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="reviews" className="data-[state=active]:bg-card px-4 py-2">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="p-5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] text-primary bg-primary/10 rounded px-2 py-0.5 w-fit uppercase font-bold tracking-wider mb-2">
                              {activeLesson.moduleTitle}
                            </p>
                            <h1 className="text-xl font-bold text-foreground mb-4">{activeLesson.title}</h1>
                          </div>
                          {activeLesson.pdfUrl && (
                            <a
                              href={activeLesson.pdfUrl.includes("cloudinary.com") ? activeLesson.pdfUrl.replace("/upload/", "/upload/fl_attachment/") : activeLesson.pdfUrl}
                              download={`${activeLesson.title.replace(/\s+/g, "_")}.pdf`}
                              target="_self"
                              rel="noopener noreferrer"
                              className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-4 h-4" /> PDF Notes
                            </a>
                          )}
                        </div>

                        {activeLesson.content && (
                          <div className="mt-4 text-sm text-foreground my-prose border-t border-border pt-6" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        )}

                        <button
                          onClick={markComplete}
                          disabled={completedIds.has(activeLesson.id)}
                          className={cn(
                            "w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md",
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
                          return (
                            <li key={lesson.id}>
                              <button
                                onClick={() => switchLesson(lesson, mod.title)}
                                disabled={!isEnrolled}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-all",
                                  isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "hover:bg-muted text-muted-foreground",
                                  !isEnrolled && "cursor-not-allowed opacity-75"
                                )}
                              >
                                {done ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                ) : isEnrolled ? (
                                  <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                )}
                                <span className="flex-1 truncate">{lesson.title}</span>
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
    </div>
  );
};

function LessonExercises({ exercises, enrollmentId }: { lessonId: string, exercises: ExerciseItem[], enrollmentId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { isCorrect: boolean, score: number }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleSubmit = async (exercise: ExerciseItem) => {
    if (!answers[exercise.id]) {
      toast.error("Please enter an answer first");
      return;
    }
    try {
      setSubmitting(exercise.id);
      const result = await userCourseService.submitExercise(exercise.id, enrollmentId, answers[exercise.id]);

      setFeedback(prev => ({ ...prev, [exercise.id]: result }));
      toast.success(result.isCorrect ? "Correct answer!" : "Incorrect answer. Try again.");
    } catch (e) {
      toast.error("Failed to submit answer");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {[...exercises].sort((a, b) => a.order - b.order).map((ex, idx) => {
        const fb = feedback[ex.id];
        return (
          <div key={ex.id} className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-sm">
            <h3 className="font-semibold text-foreground text-sm">
              Q{idx + 1}. {ex.question}
            </h3>

            {ex.type === 'MCQ' && ex.options && (
              <RadioGroup
                value={answers[ex.id] || ""}
                onValueChange={(val) => setAnswers(prev => ({ ...prev, [ex.id]: val }))}
                className="space-y-2 mt-3"
              >
                {ex.options.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} />
                    <Label htmlFor={`opt-${opt.id}`} className="text-sm font-normal text-muted-foreground">{opt.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {ex.type === 'FILL_IN_BLANKS' && (
              <Input
                value={answers[ex.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                placeholder="Type your answer here..."
                disabled={!!fb?.isCorrect}
                className="mt-3 max-w-sm"
              />
            )}

            <div className="flex items-center gap-4 mt-4 pt-2 border-t border-border/50">
              <button
                onClick={() => handleSubmit(ex)}
                disabled={submitting === ex.id || !!fb?.isCorrect}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-medium rounded-md text-xs disabled:opacity-50 transition-colors"
              >
                {submitting === ex.id ? "Submitting..." : fb?.isCorrect ? "Solved ✓" : "Submit Answer"}
              </button>

              {fb && (
                <span className={cn("text-xs font-semibold", fb.isCorrect ? "text-green-500" : "text-red-500")}>
                  {fb.isCorrect ? "Great job!" : "Incorrect, please try again."}
                </span>
              )}
            </div>
          </div>
        );
      })}
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
    <div className="space-y-6 mt-4">
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

export default CourseDetail;
