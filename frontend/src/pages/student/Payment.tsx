// src/pages/student/Payment.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, CreditCard, Loader2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import paymentService from '@/services/payment.service';
import userCourseService from '@/services/user.course.service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const loadRazorpay = () => {
    return new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
        document.body.appendChild(script);
    });
};

const Payment = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const courseTitle = location?.state?.title || "Course Masterclass";
    const amount = Number(location?.state?.amount || 0);

    useEffect(() => {
        const init = async () => {
            if (!courseId) {
                setError("Invalid course selected");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // 1. Create Order on Backend
                const data = await paymentService.createOrder({
                    courseId,
                    amount,
                });

                // 2. Load Razorpay Script
                await loadRazorpay();

                // 3. Configure Checkout Options
                const options = {
                    key: data.keyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'TradeAlgo LMS',
                    description: `${courseTitle}`,
                    order_id: data.orderId,
                    handler: async (response: any) => {
                        try {
                            setLoading(true);
                            await paymentService.verifyRazorpay({
                                paymentId: data.paymentId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            });

                            toast.success('Payment successful! Finalizing your enrollment...');
                            await userCourseService.enroll(courseId);
                            navigate(`/user/course/${courseId}`);
                        } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Verification failed. Please contact support.');
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                    },
                    theme: {
                        color: '#6366F1', // Primary Indigo
                    },
                    modal: {
                        ondismiss: async () => {
                            setLoading(false);
                            if (data?.paymentId) {
                                try {
                                    await paymentService.updateStatus(data.paymentId, 'FAILED');
                                } catch (e) {
                                    console.error("Failed to cancel payment record", e);
                                }
                            }
                            toast.info("Payment cancelled.");
                            navigate(-1); // Redirect back to course details if modal closed
                        }
                    }
                } as any;

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                setLoading(false);
            } catch (err: any) {
                const msg = err?.response?.data?.message || 'Failed to initiate payment. Please try again.';
                setError(msg);
                toast.error(msg);
                setLoading(false);
            }
        };

        init();
    }, [courseId, user]);

    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-background">
                <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-destructive/20 bg-destructive/5">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Payment Error</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                    <Button onClick={() => navigate(-1)} variant="outline" className="w-full gap-2">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full"
            >
                <Card className="relative overflow-hidden border-border bg-card shadow-2xl p-8 text-center space-y-8">
                    {/* Animated Background Accent */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

                    {/* Icon Section */}
                    <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 transform rotate-3 transition-transform duration-500">
                            <CreditCard className="w-10 h-10 text-primary" />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute top-0 right-1/2 translate-x-12 -translate-y-2"
                        >
                            <Sparkles className="w-6 h-6 text-amber-400 opacity-60" />
                        </motion.div>
                    </div>

                    {/* Heading */}
                    <div className="space-y-3 relative z-10">
                        <h1 className="text-2xl font-black tracking-tight">{loading ? 'Preparing Secure Checkout' : 'Redirecting to Razorpay'}</h1>
                        <p className="text-muted-foreground text-sm max-w-[320px] mx-auto leading-relaxed">
                            We're setting up a safe and secure payment gateway for your purchase. Please wait while we connect.
                        </p>
                    </div>

                    {/* Order Details Brief */}
                    <div className="bg-muted/50 rounded-xl p-4 border border-border shadow-inner text-left space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Order Summary</span>
                            <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SSL Secured</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="min-w-0 pr-4">
                                <p className="text-sm font-semibold truncate text-foreground">{courseTitle}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Premium Course Access</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xl font-black text-primary">₹{amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Loader */}
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-full border border-primary/20">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Awaiting Gateway...</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground animate-pulse font-medium">
                            Please do not close or refresh this page.
                        </p>
                    </div>
                </Card>

                {/* Security Stickers */}
                <div className="mt-8 flex flex-wrap justify-center items-center gap-6 opacity-40 grayscale contrast-125">
                    <div className="text-[10px] font-bold tracking-tighter uppercase px-3 py-1 border border-border rounded">
                        PCI-DSS COMPLIANT
                    </div>
                    <div className="text-[10px] font-bold tracking-tighter uppercase px-3 py-1 border border-border rounded">
                        256-BIT ENCRYPTION
                    </div>
                    <div className="text-[10px] font-bold tracking-tighter uppercase px-3 py-1 border border-border rounded">
                        SECURE GATEWAY
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payment;
