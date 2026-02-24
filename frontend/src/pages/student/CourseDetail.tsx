import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const courseData = {
  id: "1",
  title: "Forex Trading Fundamentals",
  instructor: "James Carter",
  rating: 4.8,
  reviews: 342,
  description:
    "Master the forex market from scratch. This comprehensive course covers everything from currency pairs, pip values, lot sizes, to advanced order types and risk management strategies. Perfect for beginners who want a solid foundation in forex trading.",
  progress: 72,
  sections: [
    {
      title: "Getting Started",
      lessons: [
        { id: "1", title: "Introduction to Forex", duration: "12:30", completed: true },
        { id: "2", title: "How Currency Markets Work", duration: "18:45", completed: true },
        { id: "3", title: "Major, Minor & Exotic Pairs", duration: "15:20", completed: true },
      ],
    },
    {
      title: "Core Concepts",
      lessons: [
        { id: "4", title: "Understanding Pips & Lots", duration: "20:10", completed: true },
        { id: "5", title: "Leverage & Margin Explained", duration: "22:30", completed: true },
        { id: "6", title: "Order Types Deep Dive", duration: "25:00", completed: false },
      ],
    },
    {
      title: "Technical Analysis",
      lessons: [
        { id: "7", title: "Candlestick Patterns", duration: "28:15", completed: false },
        { id: "8", title: "Support & Resistance", duration: "24:00", completed: false },
        { id: "9", title: "Moving Averages", duration: "19:40", completed: false },
      ],
    },
    {
      title: "Risk Management",
      lessons: [
        { id: "10", title: "Position Sizing", duration: "16:30", completed: false },
        { id: "11", title: "Stop Loss Strategies", duration: "21:00", completed: false },
        { id: "12", title: "Risk-Reward Ratio", duration: "14:50", completed: false },
      ],
    },
  ],
};

const CourseDetail = () => {
  const { id: _id } = useParams();
  const [activeLesson, setActiveLesson] = useState(courseData.sections[1].lessons[2]);

  const totalLessons = courseData.sections.reduce((a, s) => a + s.lessons.length, 0);
  const completedLessons = courseData.sections.reduce(
    (a, s) => a + s.lessons.filter((l) => l.completed).length,
    0
  );

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <Link
        to="/user/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Video Player */}
        <div>
          <div className="bg-sidebar rounded-xl aspect-video flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Play className="w-16 h-16 text-primary-foreground/80 group-hover:text-primary-foreground group-hover:scale-110 transition-all z-10" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <p className="text-primary-foreground text-sm font-medium">{activeLesson.title}</p>
              <p className="text-primary-foreground/60 text-xs mt-0.5">{activeLesson.duration}</p>
            </div>
          </div>

          {/* Below video: Tabs */}
          <div className="mt-5">
            <Tabs defaultValue="overview">
              <TabsList className="bg-muted w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">About this course</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {courseData.description}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <textarea
                    placeholder="Add your notes for this lesson..."
                    className="w-full min-h-[120px] bg-muted rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <button className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
                    Save Note
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  {[
                    { name: "John D.", rating: 5, text: "Excellent course for beginners!" },
                    { name: "Maria S.", rating: 4, text: "Very thorough, wish there were more examples." },
                    { name: "Alex T.", rating: 5, text: "Best forex course I've taken." },
                  ].map((review, i) => (
                    <div key={i} className="flex gap-3 pb-4 border-b border-border last:border-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{review.name}</span>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, j) => (
                              <Star key={j} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{review.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT: Course Info + Lessons */}
        <div>
          <div className="bg-card rounded-xl border border-border p-5 mb-5">
            <h2 className="text-lg font-bold text-foreground">{courseData.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span>{courseData.instructor}</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {courseData.rating} ({courseData.reviews} reviews)
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">
                  {completedLessons}/{totalLessons} lessons completed
                </span>
                <span className="font-semibold text-primary">{courseData.progress}%</span>
              </div>
              <Progress value={courseData.progress} className="h-2" />
            </div>
          </div>

          {/* Lessons Accordion */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Course Content</h3>
            </div>
            <Accordion type="multiple" defaultValue={["section-1"]} className="px-2 py-1">
              {courseData.sections.map((section, si) => (
                <AccordionItem key={si} value={`section-${si}`} className="border-0">
                  <AccordionTrigger className="px-3 py-3 text-sm font-medium text-foreground hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>{section.title}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        ({section.lessons.length} lessons)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <ul className="space-y-0.5">
                      {section.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <button
                            onClick={() => setActiveLesson(lesson)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                              activeLesson.id === lesson.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground"
                            )}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-profit-foreground flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Mark Complete Button */}
            <div className="p-4 border-t border-border">
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                Mark Lesson as Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
