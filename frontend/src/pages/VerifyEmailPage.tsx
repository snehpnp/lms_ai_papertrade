import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Invalid verification link.");
                return;
            }

            try {
                const { data } = await axiosInstance.get(`/auth/verify-email?token=${token}`);
                setStatus("success");
                setMessage(data.message || "Your email has been verified successfully!");
                toast.success("Email verified! You can now log in.");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.response?.data?.message || "Verification failed. The link may have expired.");
                toast.error("Verification failed.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <h2 className="text-xl font-semibold">Verifying your email...</h2>
                        <p className="text-muted-foreground">Please wait a moment while we confirm your registration.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Verification Complete!</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                        >
                            Go to Login <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Verification Failed</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="mt-6 w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
