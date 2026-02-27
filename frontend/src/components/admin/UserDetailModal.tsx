import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    User, Wallet, BookOpen, BarChart2, Calendar,
    Shield, ArrowUpRight, ArrowDownRight, TrendingUp,
    Clock, CheckCircle2, AlertCircle, Info, Mail, Phone, ChevronDown
} from "lucide-react";
import { adminReportsService } from "@/services/admin.service";
import { adminUsersService, AdminUser } from "@/services/admin.users.service";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UserDetailModalProps {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
}

// ─── Expandable Course Card ────────────────────────────────────────────────
interface CourseCardProps {
    enr: any;
    formatDate: (d: any, f?: string) => string;
}

const CourseCard = ({ enr, formatDate }: CourseCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const progress = Number(enr.progressPct || enr.progress || 0);
    const isCompleted = progress >= 100 || enr.status === "COMPLETED";

    // Extra metadata fields that might overflow
    const extraFields = [
        enr.instructor && { label: "Instructor", value: enr.instructor },
        enr.category && { label: "Category", value: enr.category },
        enr.level && { label: "Level", value: enr.level },
        enr.language && { label: "Language", value: enr.language },
        enr.lastAccessed && { label: "Last Accessed", value: formatDate(enr.lastAccessed, "MMM d, yyyy") },
        enr.expiresAt && { label: "Expires", value: formatDate(enr.expiresAt, "MMM d, yyyy") },
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <div
            className={cn(
                "group bg-background border rounded-2xl hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden",
                expanded && "border-primary/30 shadow-lg"
            )}
        >
            {/* ── Always-visible top section ── */}
            <div className="p-4 md:p-5 flex flex-col sm:flex-row gap-4 md:gap-5">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    {enr.thumbnail || enr.course?.thumbnail ? (
                        <img
                            src={enr.thumbnail || enr.course?.thumbnail}
                            alt={enr.courseTitle || enr.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
                            <BookOpen className="w-10 h-10" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <h5 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                {enr.courseTitle || enr.title}
                            </h5>
                            <Badge
                                className={cn(
                                    "text-[8px] px-1.5 font-black uppercase shrink-0",
                                    isCompleted ? "bg-emerald-500 text-white border-transparent" : "bg-primary/20 text-primary"
                                )}
                                variant="outline"
                            >
                                {isCompleted ? "Done" : "In Progress"}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Started {formatDate(enr.createdAt, "MMM d, yyyy")}
                        </p>

                        {/* Short description preview (if any) */}
                        {enr.description && !expanded && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                {enr.description}
                            </p>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-end text-[10px]">
                            <span className="font-bold text-muted-foreground">
                                {enr.completedLessons || 0} / {enr.totalLessons || 0} Lessons
                            </span>
                            <span className="font-black text-primary">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000 ease-out rounded-full",
                                    isCompleted
                                        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                )}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Expandable extra content ── */}
            {(extraFields.length > 0 || enr.description) && (
                <>
                    {/* Expanded body */}
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-dashed border-border/60 pt-4 space-y-3">
                            {/* Full description */}
                            {enr.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {enr.description}
                                </p>
                            )}

                            {/* Extra metadata grid */}
                            {extraFields.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                    {extraFields.map(({ label, value }) => (
                                        <div key={label} className="flex flex-col">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">{label}</span>
                                            <span className="font-semibold truncate">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Scrollable lesson list if provided */}
                            {Array.isArray(enr.lessons) && enr.lessons.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Lessons</p>
                                    <ScrollArea className="h-40 rounded-xl border bg-muted/20 px-3 py-2">
                                        <ul className="space-y-1.5">
                                            {enr.lessons.map((lesson: any, idx: number) => (
                                                <li key={lesson.id || idx} className="flex items-center gap-2 text-xs">
                                                    <span className={cn(
                                                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-bold",
                                                        lesson.completed ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {lesson.completed ? "✓" : idx + 1}
                                                    </span>
                                                    <span className={cn("truncate", lesson.completed && "line-through opacity-60")}>
                                                        {lesson.title}
                                                    </span>
                                                    {lesson.duration && (
                                                        <span className="ml-auto text-[9px] text-muted-foreground whitespace-nowrap">
                                                            {lesson.duration}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expand / Collapse toggle */}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border-t border-dashed border-border/40"
                    >
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", expanded && "rotate-180")} />
                        {expanded ? "Show less" : "Show more"}
                    </button>
                </>
            )}
        </div>
    );
};


// ─── Main Modal ───────────────────────────────────────────────────────────
const UserDetailModal = ({ user, open, onClose }: UserDetailModalProps) => {
    const [loading, setLoading] = useState(true);
    const [ledgerPage, setLedgerPage] = useState(1);
    const itemsPerPage = 8;
    const [data, setData] = useState<any>({
        profile: null,
        wallet: null,
        courses: null,
        trades: null,
    });

    useEffect(() => {
        if (open && user?.id) {
            fetchUserData(user.id);
        }
    }, [open, user]);

    const fetchUserData = async (userId: string) => {
        try {
            setLoading(true);
            const response = await adminReportsService.fullReport(userId);
            const { profile, wallet, trading, courses } = response.data;

            setData({
                profile: profile || null,
                wallet: wallet?.data || wallet || null,
                courses: courses?.enrollments || courses?.data || courses?.items || courses || [],
                trades: trading?.data || trading || null,
            });
        } catch (error) {
            console.error("Failed to fetch user data", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: any, formatStr: string = "PPP") => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "N/A" : format(date, formatStr);
    };

    if (!user) return null;

    const courseList = Array.isArray(data.courses)
        ? data.courses
        : (data.courses?.enrollments || data.courses?.items || []);

    const completedCourses = courseList.filter(
        (c: any) => c.progressPct >= 100 || c.progress >= 100 || c.status === "COMPLETED"
    ).length;

    const tradeStats = data.trades || {};
    const winRate = Number(tradeStats.winRate || 0);
    const netPnl = Number(tradeStats.netPnl || 0);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] md:max-w-5xl max-h-[95vh] h-[95vh] md:h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">

                {/* ── Premium Header ── */}
                <div className="relative overflow-hidden bg-primary/5 p-4 md:p-8 border-b border-primary/10 shrink-0">
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                        <User className="w-40 h-40" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-1 shadow-lg shadow-primary/20">
                                <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                                    {data.profile?.avatar ? (
                                        <img src={data.profile.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-primary" />
                                    )}
                                </div>
                            </div>
                            <div className={cn(
                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold",
                                user.isBlocked ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                            )}>
                                {user.isBlocked ? "!" : "✓"}
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                                <h2 className="text-xl md:text-3xl font-bold tracking-tight">{user.name}</h2>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase py-0.5 px-3">
                                    {user.role}
                                </Badge>
                                {user.isBlocked && <Badge variant="destructive" className="animate-pulse">BLOCKED</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                                {user.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{user.phoneNumber}</span>}
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined {formatDate(user.createdAt, "MMM yyyy")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                    {/* ── Tab Bar ── */}
                    <div className="px-4 md:px-8 bg-background/50 backdrop-blur-md border-b sticky top-0 z-20 shrink-0">
                        <TabsList className="bg-transparent border-b-0 h-14 w-full justify-start gap-4 md:gap-8 p-0 overflow-x-auto no-scrollbar scroll-smooth">
                            {["overview", "wallet", "courses", "trades"].map(tab => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none px-0 h-14 text-sm font-semibold transition-all capitalize"
                                >
                                    {tab === "wallet" ? "Wallet Ledger" : tab === "courses" ? "Course Progress" : tab === "trades" ? "Trading Analytics" : "Overview"}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* ── Scrollable Content Area ── */}
                    <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        <div className="p-4 md:p-8">
                            {loading ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                                    </div>
                                    <Skeleton className="h-64 w-full rounded-2xl" />
                                </div>
                            ) : (
                                <>
                                    {/* ── OVERVIEW ── */}
                                    <TabsContent value="overview" className="mt-0 space-y-8 outline-none">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                            <div className="bg-background border border-primary/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 md:p-3 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                                        <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wallet</p>
                                                        <h4 className="text-sm md:text-2xl font-bold font-mono truncate max-w-[100px] md:max-w-none">
                                                            ₹{Number(data.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-background border border-blue-500/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 md:p-3 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
                                                        <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Courses</p>
                                                        <h4 className="text-sm md:text-2xl font-bold">
                                                            {courseList.length}{" "}
                                                            <span className="hidden md:inline text-sm font-normal text-muted-foreground">({completedCourses} Done)</span>
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-background border border-emerald-500/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 md:p-3 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                                                        <BarChart2 className="w-5 h-5 md:w-6 md:h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net P&L</p>
                                                        <h4 className={cn("text-sm md:text-2xl font-bold font-mono truncate max-w-[100px] md:max-w-none", netPnl >= 0 ? "text-emerald-600" : "text-red-600")}>
                                                            {netPnl >= 0 ? "+" : ""}₹{Math.abs(netPnl).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-background rounded-2xl border border-border overflow-hidden">
                                                <div className="bg-muted/50 px-6 py-4 border-b">
                                                    <h4 className="font-bold flex items-center gap-2 text-sm"><Info className="w-4 h-4 text-primary" /> System Metrics</h4>
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                                        <span className="text-muted-foreground">Internal ID</span>
                                                        <span className="font-mono text-right truncate pl-4">{user.id}</span>

                                                        <span className="text-muted-foreground">Referral Code</span>
                                                        <span className="font-bold text-right text-primary">{user.referralCode}</span>

                                                        <span className="text-muted-foreground">Referred By</span>
                                                        <span className="text-right italic">{user.referrerName || "System / Organic"}</span>

                                                        <span className="text-muted-foreground">Learning Mode</span>
                                                        <span className="text-right">
                                                            <Badge className={user.isLearningMode ? "bg-blue-500/10 text-blue-600 border-blue-200" : "bg-zinc-500/10 text-zinc-600 border-zinc-200"} variant="outline">
                                                                {user.isLearningMode ? "Paper Trade" : "Learning"}
                                                            </Badge>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-background rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                    <Clock className="w-8 h-8 text-primary" />
                                                </div>
                                                <h5 className="font-bold">Active Sessions</h5>
                                                <p className="text-sm text-muted-foreground mt-1">User is currently active on the platform. Last activity observed today.</p>
                                                <div className="mt-4 flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600">Online Now</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* ── WALLET LEDGER ── */}
                                    <TabsContent value="wallet" className="mt-0 space-y-4 md:space-y-6">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                                    <Wallet className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold">Ledger Balance</h4>
                                                    <p className="text-sm text-muted-foreground">Available funds for paper trading</p>
                                                </div>
                                            </div>
                                            <div className="text-3xl font-bold font-mono text-primary">
                                                ₹{Number(data.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>

                                        <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
                                            <div className="px-6 py-4 border-b bg-muted/30">
                                                <h5 className="font-bold text-sm">Recent Transactions</h5>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/10">
                                                        <tr className="border-b">
                                                            <th className="text-left py-4 px-6 font-semibold text-muted-foreground uppercase text-[10px] tracking-widest">Date</th>
                                                            <th className="text-left py-4 px-6 font-semibold text-muted-foreground uppercase text-[10px] tracking-widest">Detail</th>
                                                            <th className="text-right py-4 px-6 font-semibold text-muted-foreground uppercase text-[10px] tracking-widest">Amount</th>
                                                            <th className="text-center py-4 px-6 font-semibold text-muted-foreground uppercase text-[10px] tracking-widest">Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {data.wallet?.transactions && data.wallet.transactions.length > 0 ? (
                                                            data.wallet.transactions
                                                                .slice((ledgerPage - 1) * itemsPerPage, ledgerPage * itemsPerPage)
                                                                .map((tx: any) => (
                                                                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors text-xs md:text-sm">
                                                                        <td className="py-3 md:py-4 px-6 text-muted-foreground whitespace-nowrap">{formatDate(tx.createdAt, "MMM d, HH:mm")}</td>
                                                                        <td className="py-3 md:py-4 px-6 font-medium max-w-[150px] md:max-w-none truncate">{tx.description}</td>
                                                                        <td className={`py-3 md:py-4 px-6 text-right font-mono font-bold ${tx.type === "CREDIT" ? "text-emerald-600" : "text-red-600"}`}>
                                                                            {tx.type === "CREDIT" ? "+" : "-"}₹{Number(tx.amount || 0).toFixed(2)}
                                                                        </td>
                                                                        <td className="py-3 md:py-4 px-6 text-center">
                                                                            <Badge className={cn("text-[9px] font-bold", tx.type === "CREDIT" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200")} variant="outline">
                                                                                {tx.type}
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="py-20 text-center">
                                                                    <div className="flex flex-col items-center justify-center opacity-30">
                                                                        <AlertCircle className="w-12 h-12 mb-2" />
                                                                        <p className="font-medium">No ledger entries found</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {data.wallet?.transactions?.length > itemsPerPage && (
                                                <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t">
                                                    <p className="text-xs text-muted-foreground">
                                                        Showing {(ledgerPage - 1) * itemsPerPage + 1} to {Math.min(ledgerPage * itemsPerPage, data.wallet.transactions.length)} of {data.wallet.transactions.length}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                                                            disabled={ledgerPage === 1}
                                                            className="px-3 py-1 rounded-md bg-background border text-xs font-bold disabled:opacity-50 hover:bg-muted transition-colors"
                                                        >
                                                            Prev
                                                        </button>
                                                        <button
                                                            onClick={() => setLedgerPage(p => Math.min(Math.ceil(data.wallet.transactions.length / itemsPerPage), p + 1))}
                                                            disabled={ledgerPage >= Math.ceil(data.wallet.transactions.length / itemsPerPage)}
                                                            className="px-3 py-1 rounded-md bg-background border text-xs font-bold disabled:opacity-50 hover:bg-muted transition-colors"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* ── COURSES ── */}
                                    <TabsContent value="courses" className="mt-0 space-y-4 md:space-y-6">
                                        {/* Stats bar */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Enrollments</p>
                                                <p className="text-2xl font-bold">{courseList.length}</p>
                                            </div>
                                            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Completed</p>
                                                <p className="text-2xl font-bold text-emerald-600">{completedCourses}</p>
                                            </div>
                                            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg. Progress</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {courseList.length > 0
                                                        ? (courseList.reduce((acc: number, c: any) => acc + (c.progressPct || c.progress || 0), 0) / courseList.length).toFixed(0)
                                                        : 0}%
                                                </p>
                                            </div>
                                            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Learning</p>
                                                <p className="text-2xl font-bold text-amber-600">{courseList.length - completedCourses}</p>
                                            </div>
                                        </div>

                                        {/* Course Cards — dynamic expand/collapse */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                            {courseList.length > 0 ? (
                                                courseList.map((enr: any) => (
                                                    <CourseCard key={enr.id} enr={enr} formatDate={formatDate} />
                                                ))
                                            ) : (
                                                <div className="col-span-2 py-20 text-center bg-background rounded-3xl border-2 border-dashed border-muted flex flex-col items-center">
                                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                                                        <BookOpen className="w-8 h-8 opacity-20" />
                                                    </div>
                                                    <h6 className="font-bold">No course content found</h6>
                                                    <p className="text-xs text-muted-foreground max-w-[200px] mt-2">The user hasn't enrolled in any educational modules yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* ── TRADES ── */}
                                    <TabsContent value="trades" className="mt-0 space-y-6 md:space-y-8">
                                        <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -ml-32 -mb-32" />

                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                                    <div className="space-y-2">
                                                        <h4 className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Net Result Performance</h4>
                                                        <div className="flex items-baseline flex-wrap gap-2">
                                                            <h2 className={cn("text-3xl md:text-5xl font-black font-mono tracking-tighter", netPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                                {netPnl >= 0 ? "▲" : "▼"}₹{Math.abs(netPnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </h2>
                                                            <span className="text-slate-500 text-sm font-bold uppercase">Total P&L</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                                                        <div className="text-right">
                                                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Win Rate</p>
                                                            <p className="text-2xl md:text-4xl font-black text-primary tracking-tighter">{winRate?.toFixed(2)}%</p>
                                                        </div>
                                                        <div className="text-right border-l border-slate-700 pl-4 md:pl-8">
                                                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Avg. P&L</p>
                                                            <p className={cn("text-xl md:text-3xl font-black tracking-tighter", Number(tradeStats.avgPnl || 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                                ₹{Math.abs(Number(tradeStats.avgPnl || 0)).toFixed(0)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800">
                                                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-1">Total Executed</p>
                                                        <p className="text-xl font-bold">{tradeStats.totalTrades || 0} Trades</p>
                                                    </div>
                                                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                                                        <p className="text-emerald-500/70 font-bold text-[9px] uppercase tracking-widest mb-1">Winning</p>
                                                        <p className="text-xl font-bold text-emerald-400 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" />{tradeStats.winners || 0}</p>
                                                    </div>
                                                    <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                                                        <p className="text-red-500/70 font-bold text-[9px] uppercase tracking-widest mb-1">Losing</p>
                                                        <p className="text-xl font-bold text-red-400 flex items-center gap-2"><ArrowDownRight className="w-4 h-4" />{tradeStats.losers || 0}</p>
                                                    </div>
                                                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                                                        <p className="text-primary/70 font-bold text-[9px] uppercase tracking-widest mb-1">Total Orders</p>
                                                        <p className="text-xl font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4" />{tradeStats.totalOrders || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {tradeStats.recentTrades && tradeStats.recentTrades.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <h5 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Recent Executions</h5>
                                                    <Badge variant="outline" className="text-[9px]">Last 10 Activities</Badge>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {tradeStats.recentTrades.map((trade: any) => (
                                                        <div key={trade.id} className="bg-background border rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 transition-all shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                                                                    trade.side === "BUY" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                                                )}>
                                                                    {trade.side === "BUY" ? "B" : "S"}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-sm">{trade.symbol}</p>
                                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium italic underline underline-offset-4 decoration-primary/20">
                                                                        {trade.quantity} units @ ₹{Number(trade.price || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={cn("font-mono font-black text-sm", trade.pnl >= 0 ? "text-emerald-600" : "text-red-600")}>
                                                                    {trade.pnl >= 0 ? "+" : ""}₹{Number(trade.pnl || 0).toFixed(2)}
                                                                </p>
                                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60">P&L Result</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-3xl border-2 border-dashed opacity-50">
                                                <BarChart2 className="w-16 h-16 mb-4 text-muted-foreground/30" />
                                                <p className="font-black text-sm uppercase tracking-[0.2em]">No trading data processed</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailModal;