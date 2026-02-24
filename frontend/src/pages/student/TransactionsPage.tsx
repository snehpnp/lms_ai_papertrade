import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    BookOpen,
    ArrowRight,
    Eye,
    Receipt,
    Hash
} from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/services/payment.service";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Transaction {
    id: string;
    amount: string;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    provider: string;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    createdAt: string;
    metadata: any;
    course: {
        title: string;
    };
}

const StudentTransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await paymentService.getMyHistory();
            setTransactions(data);
        } catch {
            toast.error("Failed to load your transaction history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "FAILED":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "PENDING":
                return <Clock className="w-5 h-5 text-amber-500" />;
            default:
                return <Receipt className="w-5 h-5 text-muted-foreground" />;
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

    if (loading) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading your transactions...</div>;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="My Transactions"
                subtitle="View your course purchase history and receipts"
            />

            {transactions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Receipt className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">No transactions yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            When you purchase a course, your payment details and order history will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {transactions.map((t) => (
                        <Card
                            key={t.id}
                            className="group overflow-hidden hover:shadow-md transition-all cursor-pointer border-border/60 hover:border-primary/30"
                            onClick={() => setSelectedTx(t)}
                        >
                            <CardContent className="p-0">
                                <div className="flex items-center p-4">
                                    <div className={`p-3 rounded-xl mr-4 ${t.status === 'SUCCESS' ? 'bg-green-500/10' :
                                        t.status === 'FAILED' ? 'bg-red-500/10' :
                                            'bg-amber-500/10'
                                        }`}>
                                        {getStatusIcon(t.status)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold truncate pr-2 group-hover:text-primary transition-colors">
                                                {t.course.title}
                                            </h3>
                                            <span className="text-sm font-bold whitespace-nowrap">
                                                ₹{Number(t.amount).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span>{format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}</span>
                                                <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] uppercase font-medium">
                                                    {t.provider}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="h-5 px-1 bg-transparent group-hover:bg-muted font-normal">
                                                    Details <ArrowRight className="w-3 h-3 ml-1" />
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Transaction Details Modal */}
            <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            Transaction Details
                        </DialogTitle>
                        <DialogDescription>
                            Full information about your purchase
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTx && (
                        <div className="space-y-6 pt-2">
                            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Total Amount</p>
                                <p className="text-3xl font-black">₹{Number(selectedTx.amount).toLocaleString()}</p>
                                <div className="mt-3">{getStatusBadge(selectedTx.status)}</div>
                            </div>

                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">Order Information</h4>
                                    <div className="space-y-2 text-sm bg-card p-4 rounded-xl border border-border">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Course</span>
                                            <span className="font-medium text-right ml-4">{selectedTx.course.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Date & Time</span>
                                            <span className="font-medium">{format(new Date(selectedTx.createdAt), "PPP p")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Payment Method</span>
                                            <span className="font-medium uppercase">{selectedTx.metadata?.method || selectedTx.provider}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">Gateway Details</h4>
                                    <div className="space-y-2 text-sm bg-card p-4 rounded-xl border border-border font-mono">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground text-[10px] uppercase font-sans">Razorpay Order ID</span>
                                            <span className="text-xs break-all">{selectedTx.providerOrderId || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                                            <span className="text-muted-foreground text-[10px] uppercase font-sans">Razorpay Payment ID</span>
                                            <span className="text-xs break-all">{selectedTx.providerPaymentId || 'N/A'}</span>
                                        </div>
                                        {selectedTx.metadata?.vpa && (
                                            <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                                                <span className="text-muted-foreground text-[10px] uppercase font-sans">UPI VPA</span>
                                                <span className="text-xs break-all">{selectedTx.metadata.vpa}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <Button className="w-full" onClick={() => setSelectedTx(null)}>Close</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentTransactionsPage;
