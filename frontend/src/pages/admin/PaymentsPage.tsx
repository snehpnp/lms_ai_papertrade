import { useEffect, useState, useMemo } from "react";
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
    ArrowRight,
    Eye,
    Receipt,
    ExternalLink,
    Hash
} from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/services/payment.service";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DataTable, { Column } from "@/components/common/DataTable";

interface PaymentLog {
    id: string;
    amount: string;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    provider: string;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    createdAt: string;
    metadata: any;
    user: {
        id: string;
        name: string;
        email: string;
        phoneNumber?: string;
    };
    course: {
        id: string;
        title: string;
    };
}

const AdminPaymentsPage = () => {
    const [payments, setPayments] = useState<PaymentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedPayment, setSelectedPayment] = useState<PaymentLog | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;

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

    const filtered = useMemo(() => {
        return payments.filter((p) => {
            const matchesSearch =
                p.user.name.toLowerCase().includes(search.toLowerCase()) ||
                p.user.email.toLowerCase().includes(search.toLowerCase()) ||
                p.course.title.toLowerCase().includes(search.toLowerCase()) ||
                p.providerOrderId?.toLowerCase().includes(search.toLowerCase()) ||
                p.providerPaymentId?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, search, statusFilter]);

    // Local pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * limit;
        return filtered.slice(start, start + limit);
    }, [filtered, page]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    if (loading) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading transactions...</div>;
    }

    const columns: Column<PaymentLog>[] = [
        {
            header: "#",
            render: (_row: PaymentLog, index: number) => (
                <span className="font-medium">{(page - 1) * limit + index + 1}</span>
            ),
            className: "w-16 text-center",
        },
        {
            header: "User",
            render: (p) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{p.user.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Course",
            render: (p) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{p.course.title}</span>
                </div>
            )
        },
        {
            header: "Amount",
            render: (p) => (
                <>
                    <p className="text-sm font-bold">₹{Number(p.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{p.provider}</p>
                </>
            )
        },
        {
            header: "Status",
            render: (p) => getStatusBadge(p.status)
        },
        {
            header: "Date",
            render: (p) => format(new Date(p.createdAt), "MMM d, HH:mm"),
            className: "text-sm",
        },
        {
            header: "Actions",
            className: "text-right",
            render: (p) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(p)}
                        className="h-8 w-8 p-0"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Payment Transactions"
                subtitle="Monitor all course purchases and payment statuses"
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
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

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                        Total Records: {filtered.length}
                    </span>
                    <div className="flex items-center gap-2">
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
            </div>

            <DataTable
                columns={columns}
                data={paginatedItems}
                emptyMessage="No transactions found"
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* Details Modal */}
            <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            Transaction Details
                        </DialogTitle>
                        <DialogDescription>
                            Full information about payment ID: {selectedPayment?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-6 pt-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Amount</p>
                                    <p className="text-lg font-bold">₹{Number(selectedPayment.amount).toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                                </div>
                            </div>

                            {/* Info Groups */}
                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                        <User className="w-3 h-3" /> User Info
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm bg-card p-3 rounded-xl border border-border">
                                        <span className="text-muted-foreground">Name</span>
                                        <span className="font-medium text-right">{selectedPayment.user.name}</span>
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium text-right">{selectedPayment.user.email}</span>
                                        {selectedPayment.user.phoneNumber && (
                                            <>
                                                <span className="text-muted-foreground">Phone</span>
                                                <span className="font-medium text-right">{selectedPayment.user.phoneNumber}</span>
                                            </>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Purchase Info
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm bg-card p-3 rounded-xl border border-border">
                                        <span className="text-muted-foreground">Course</span>
                                        <span className="font-medium text-right line-clamp-1">{selectedPayment.course.title}</span>
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium text-right">{format(new Date(selectedPayment.createdAt), "PPP p")}</span>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                        <Hash className="w-3 h-3" /> Provider Details ({selectedPayment.provider})
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm bg-card p-3 rounded-xl border border-border">
                                        <span className="text-muted-foreground">Order ID</span>
                                        <span className="font-mono text-[11px] text-right">{selectedPayment.providerOrderId || 'N/A'}</span>
                                        <span className="text-muted-foreground">Payment ID</span>
                                        <span className="font-mono text-[11px] text-right">{selectedPayment.providerPaymentId || 'N/A'}</span>

                                        {selectedPayment.metadata?.method && (
                                            <>
                                                <span className="text-muted-foreground border-t border-border pt-2 mt-2">Method</span>
                                                <span className="font-medium text-right uppercase border-t border-border pt-2 mt-2">{selectedPayment.metadata.method}</span>
                                            </>
                                        )}
                                        {selectedPayment.metadata?.vpa && (
                                            <>
                                                <span className="text-muted-foreground">UPI / VPA</span>
                                                <span className="font-medium text-right">{selectedPayment.metadata.vpa}</span>
                                            </>
                                        )}
                                        {selectedPayment.metadata?.bank && (
                                            <>
                                                <span className="text-muted-foreground">Bank</span>
                                                <span className="font-medium text-right">{selectedPayment.metadata.bank}</span>
                                            </>
                                        )}
                                        {selectedPayment.metadata?.wallet && (
                                            <>
                                                <span className="text-muted-foreground">Wallet</span>
                                                <span className="font-medium text-right">{selectedPayment.metadata.wallet}</span>
                                            </>
                                        )}
                                        {selectedPayment.metadata?.email && selectedPayment.metadata.email !== selectedPayment.user.email && (
                                            <>
                                                <span className="text-muted-foreground">Gateway Email</span>
                                                <span className="font-medium text-right">{selectedPayment.metadata.email}</span>
                                            </>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setSelectedPayment(null)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPaymentsPage;
