
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { branding } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setIsSent(true);
            toast.success("Reset link sent!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -ml-64 -mb-64" />

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                            <img src={branding.appFavicon} alt={branding.appName} className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold">{branding.appName}</span>
                    </Link>

                    {!isSent ? (
                        <>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Forgot Password?</h1>
                            <p className="text-muted-foreground mt-2">
                                No worries, we'll send you reset instructions.
                            </p>
                        </>
                    ) : (
                        <div className="scale-110">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Check your email</h1>
                            <p className="text-muted-foreground mt-2">
                                We've sent a password reset link to <br />
                                <span className="font-semibold text-foreground">{email}</span>
                            </p>
                        </div>
                    )}
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-sm"
                                    required
                                />
                                <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                "Sending..."
                            ) : (
                                <>
                                    Reset Password <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground mb-6">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-primary font-medium hover:underline text-sm"
                        >
                            Try another email address
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
