// src/pages/student/Payment.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import paymentService, { CreateOrderResponse } from '@/services/payment.service';
import userCourseService from '@/services/user.course.service';



const loadRazorpay = () => {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
        document.body.appendChild(script);
    });
};

const Payment = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState<CreateOrderResponse | null>(null);
    const [loading, setLoading] = useState(true);


    console.log("location", location?.state)

    useEffect(() => {
        const init = async () => {
            if (!courseId) return;
            try {
                const data = await paymentService.createOrder({
                    courseId,
                    amount: Number(location?.state?.amount || 0),
                }); // amount will be fetched from backend based on course price
                setOrder(data);
                await loadRazorpay();
                // open Razorpay checkout
                const options = {
                    key: data.keyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'TradeLearn Pro',
                    description: 'Course Purchase',
                    order_id: data.orderId,
                    handler: async (response: any) => {
                        try {
                            await paymentService.verifyRazorpay({
                                paymentId: data.paymentId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            });
                            toast.success('Payment successful! Enrolling...');
                            await userCourseService.enroll(courseId);
                            navigate('/user/courses');
                        } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Verification failed');
                        }
                    },
                    prefill: {},
                    theme: { color: '#6366F1' },
                } as any;
                // @ts-ignore
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Failed to create order');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [courseId, navigate, location?.state]);

    if (loading) {
        return <div className="p-8 text-center">Preparing payment...</div>;
    }

    return <div className="p-8 text-center">Redirecting to Razorpay...</div>;
};

export default Payment;
