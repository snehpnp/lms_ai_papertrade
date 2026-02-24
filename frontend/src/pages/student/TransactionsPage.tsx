import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    BookOpen,
    ArrowRight,
    ReceiptText
} from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/services/payment.service";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Transaction {
    id: string;
    amount: string;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    provider: string;
    createdAt: string;
    course: {
        title: string;
    };
}

const StudentTransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

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
                return <ReceiptText className="w-5 h-5 text-muted-foreground" />;
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
                        <ReceiptText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">No transactions yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            When you purchase a course, your payment details and order history will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {transactions.map((t) => (
                        <Card key={t.id} className="overflow-hidden hover:shadow-md transition-shadow transition-colors">
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
                                            <h3 className="text-sm font-semibold truncate pr-2">
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
                                                <span className={`font-medium ${t.status === 'SUCCESS' ? 'text-green-600' :
                                                        t.status === 'FAILED' ? 'text-red-500' :
                                                            'text-amber-600'
                                                    }`}>
                                                    {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentTransactionsPage;
