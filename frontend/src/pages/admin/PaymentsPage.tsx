import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    User,
    BookOpen,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/services/payment.service";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PaymentLog {
    id: string;
    amount: string;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    provider: string;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    course: {
        title: string;
    };
}

const AdminPaymentsPage = () => {
    const [payments, setPayments] = useState<PaymentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await paymentService.getHistory();
            setPayments(data);
        } catch {
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-green-500/20">Success</Badge>;
            case "FAILED":
                return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-red-500/20">Failed</Badge>;
            case "PENDING":
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filtered = payments.filter((p) => {
        const matchesSearch =
            p.user.name.toLowerCase().includes(search.toLowerCase()) ||
            p.user.email.toLowerCase().includes(search.toLowerCase()) ||
            p.course.title.toLowerCase().includes(search.toLowerCase()) ||
            p.providerOrderId?.toLowerCase().includes(search.toLowerCase()) ||
            p.providerPaymentId?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading transactions...</div>;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Payment Transactions"
                subtitle="Monitor all course purchases and payment statuses"
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by user, course, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider Details</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{p.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{p.course.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold">₹{Number(p.amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{p.provider}</p>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(p.status)}
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {p.providerOrderId && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Order: <span className="font-mono text-foreground">{p.providerOrderId}</span>
                                                    </p>
                                                )}
                                                {p.providerPaymentId && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Paymt: <span className="font-mono text-foreground">{p.providerPaymentId}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm">{format(new Date(p.createdAt), "MMM d, yyyy")}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(p.createdAt), "HH:mm")}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentsPage;
