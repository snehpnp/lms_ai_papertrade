import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2, XCircle, Clock, Search, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import userCourseService, { ExerciseHistoryItem } from "@/services/user.course.service";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 5;

const ExerciseHistoryPage = () => {
    const [history, setHistory] = useState<ExerciseHistoryItem[]>([]);
    const [coursesWithModules, setCoursesWithModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [selectedModule, setSelectedModule] = useState<string>("all");
    const [selectedLesson, setSelectedLesson] = useState<string>("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [historyData, coursesData] = await Promise.all([
                userCourseService.getExerciseHistory(),
                userCourseService.getCoursesWithModules().catch(() => []) // Fallback in case of 403
            ]);
            setHistory(historyData);
            setCoursesWithModules(coursesData);
        } catch (error) {
            console.error("Failed to fetch exercise history", error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique courses & lessons from the actual API if provided, or fallback to history data
    const courseOptions = useMemo(() => {
        if (coursesWithModules.length > 0) {
            return coursesWithModules.map(c => c.title);
        }
        // Fallback if the API returns empty/fails
        const titles = new Set(history?.map(h => h.courseTitle));
        return Array.from(titles);
    }, [coursesWithModules, history]);

    const lessonOptions = useMemo(() => {
        if (selectedCourse !== "all" && coursesWithModules.length > 0) {
            const course = coursesWithModules.find(c => c.title === selectedCourse);
            if (course) {
                return course.modules.flatMap((m: any) => m.lessons.map((l: any) => l.title));
            }
        }

        // Fallback
        const filteredByCourse = selectedCourse === "all" ? history : history.filter(h => h.courseTitle === selectedCourse);
        const titles = new Set(filteredByCourse.map(h => h.lessonTitle));
        return Array.from(titles);
    }, [coursesWithModules, history, selectedCourse]);

    // Apply filters
    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCourse = selectedCourse === "all" || item.courseTitle === selectedCourse;
            const matchesLesson = selectedLesson === "all" || item.lessonTitle === selectedLesson;
            return matchesSearch && matchesCourse && matchesLesson;
        });
    }, [history, searchQuery, selectedCourse, selectedLesson]);

    // Group by Course -> Lesson
    const groupedHistory = useMemo(() => {
        const groups: Record<string, Record<string, ExerciseHistoryItem[]>> = {};

        filteredHistory.forEach(item => {
            if (!groups[item.courseTitle]) groups[item.courseTitle] = {};
            if (!groups[item.courseTitle][item.lessonTitle]) groups[item.courseTitle][item.lessonTitle] = [];
            groups[item.courseTitle][item.lessonTitle].push(item);
        });

        return groups;
    }, [filteredHistory]);

    // Convert grouped data into a flat list of groups for pagination
    const groupEntries = useMemo(() => {
        const entries: { courseTitle: string, lessonTitle: string, items: ExerciseHistoryItem[] }[] = [];
        Object.keys(groupedHistory).forEach(courseTitle => {
            Object.keys(groupedHistory[courseTitle]).forEach(lessonTitle => {
                entries.push({
                    courseTitle,
                    lessonTitle,
                    items: groupedHistory[courseTitle][lessonTitle]
                });
            });
        });
        return entries;
    }, [groupedHistory]);

    const totalPages = Math.ceil(groupEntries.length / ITEMS_PER_PAGE);
    const paginatedGroups = groupEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCourse, selectedLesson]);

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader
                title="Exercise History"
                subtitle="Review your past quiz attempts with detailed grouping and filtering"
            />

            {/* Filter & Search Bar */}
            <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex flex-col gap-3 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 w-full rounded-xl"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Select value={selectedCourse} onValueChange={(val) => { setSelectedCourse(val); setSelectedLesson("all"); }}>
                        <SelectTrigger className="h-10 rounded-xl text-xs">
                            <SelectValue placeholder="Course" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courseOptions.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={selectedCourse === "all" && lessonOptions.length === 0}>
                        <SelectTrigger className="h-10 rounded-xl text-xs">
                            <SelectValue placeholder="Lesson" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Lessons</SelectItem>
                            {lessonOptions.map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-40"></CardContent>
                        </Card>
                    ))}
                </div>
            ) : groupEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-card border border-border rounded-xl shadow-sm">
                    <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Exercises Found</h2>
                    <p className="text-muted-foreground text-sm max-w-md">
                        No exercise attempts match your current filters. Try adjusting your search or selecting a different course.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {paginatedGroups.map((group, groupIdx) => {
                        const totalAttempts = group.items.length;
                        const correctAttempts = group.items.filter(i => i.isCorrect).length;
                        const incorrectAttempts = totalAttempts - correctAttempts;
                        const accuracy = Math.round((correctAttempts / totalAttempts) * 100) || 0;

                        return (
                            <Card key={`${group.courseTitle}-${group.lessonTitle}-${groupIdx}`} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="bg-muted/30 border-b border-border p-4 md:p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-foreground">
                                                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                                {group.courseTitle}
                                            </CardTitle>
                                            <p className="text-xs md:text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                                Lesson: {group.lessonTitle}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 md:gap-4 text-[10px] md:text-xs">
                                            <div className="flex flex-col items-center bg-card border border-border p-2 rounded-lg">
                                                <span className="text-muted-foreground font-semibold">Attempts</span>
                                                <span className="font-bold text-foreground">{totalAttempts}</span>
                                            </div>
                                            <div className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                                                <span className="text-emerald-600 font-semibold">Correct</span>
                                                <span className="font-bold text-emerald-700">{correctAttempts}</span>
                                            </div>
                                            <div className="flex flex-col items-center bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                                                <span className="text-rose-600 font-semibold">Incorrect</span>
                                                <span className="font-bold text-rose-700">{incorrectAttempts}</span>
                                            </div>
                                            <div className="flex flex-col items-center bg-primary/10 border border-primary/20 p-2 rounded-lg">
                                                <span className="text-primary font-semibold">Accuracy</span>
                                                <span className="font-bold ">{accuracy}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {group.items.map((item) => (
                                            <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:bg-muted/10 transition-colors">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-start gap-2">
                                                        <span className="text-muted-foreground mt-0.5">Q.</span>
                                                        {item.question}
                                                    </h4>
                                                    <div className="bg-muted/40 p-3 rounded border border-border/50">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Your Answer:</span>
                                                        <span className="text-sm font-medium text-foreground">
                                                            {typeof item.response === 'string' ? item.response :
                                                                (item.response?.answers ? item.response.answers.join(', ') :
                                                                    JSON.stringify(item.response))}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="sm:w-48 flex flex-col justify-between pt-1">
                                                    <div>
                                                        {item.isCorrect ? (
                                                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 mb-2">
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Correct
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 mb-2">
                                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Incorrect
                                                            </Badge>
                                                        )}
                                                        <div className="text-xs font-semibold text-muted-foreground">
                                                            Score: <span className="text-foreground font-black">{item.score}</span> / 100
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-4 font-mono">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(item.submittedAt), "MMM d, HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === page
                                                ? "bg-primary text-primary-foreground font-bold"
                                                : "border border-border hover:bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExerciseHistoryPage;
