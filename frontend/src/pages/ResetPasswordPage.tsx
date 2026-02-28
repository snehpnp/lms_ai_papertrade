
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const { branding } = useAuth();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid password reset link");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ token, newPassword: password });
            setIsSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -ml-64 -mb-64" />

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                            <img src={branding.appFavicon} alt={branding.appName} className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold">{branding.appName}</span>
                    </Link>

                    {!isSuccess ? (
                        <>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Set new password</h1>
                            <p className="text-muted-foreground mt-2">
                                Your new password must be different from previous used passwords.
                            </p>
                        </>
                    ) : (
                        <div className="scale-110">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Password Reset</h1>
                            <p className="text-muted-foreground mt-2">
                                Your password has been successfully reset. <br />
                                Redirecting to login...
                            </p>
                        </div>
                    )}
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-sm"
                                    required
                                />
                                <Lock className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-sm"
                                    required
                                />
                                <ShieldCheck className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                "Resetting..."
                            ) : (
                                <>
                                    Reset Password <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center pt-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline transition-colors"
                        >
                            Sign In Now <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    </div>
                )}

                {!isSuccess && (
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
