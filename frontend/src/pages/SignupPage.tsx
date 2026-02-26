import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { GoogleLogin } from "@react-oauth/google";
import authService from "@/services/auth.service";

const SignupPage = () => {
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get("ref") || "";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        referralCode: refCode,
    });

    useEffect(() => {
        if (refCode) {
            setFormData((prev) => ({ ...prev, referralCode: refCode }));
        }
    }, [refCode]);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.phoneNumber.length !== 10) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        setLoading(true);

        try {
            await authService.register(formData);
            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Registration failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setLoading(true);
        try {
            const user = await googleLogin(credentialResponse.credential);
            navigate(`/${user.role}/dashboard`);
        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error("Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Branding (Same as Login) */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />

                {/* Animated Background blobs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[10%] -right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px]"
                />

                <motion.div
                    className="relative z-10 text-center max-w-md"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <motion.div
                        className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <UserPlus className="w-10 h-10 text-primary-foreground" />
                    </motion.div>

                    <motion.h1
                        className="text-4xl font-extrabold text-foreground mb-4 tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Join TradeAlgo
                    </motion.h1>

                    <motion.p
                        className="text-lg text-muted-foreground leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Start your trading journey today. Access premium courses,
                        live market data, and a powerful paper trading simulator.
                    </motion.p>
                </motion.div>
            </div>

            {/* Right - Form */}
            <motion.div
                className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-y-auto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <motion.div
                    className="w-full max-w-md relative z-10 py-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <svg width="240" height="50" viewBox="10 20 460 100" xmlns="http://www.w3.org/2000/svg">
                            <rect x="15" y="20" width="100" height="100" rx="22" fill="#0f172a" />
                            <polyline points="35,85 60,65 78,78 100,45" stroke="#22c55e" strokeWidth="5" fill="none" />
                            <circle cx="100" cy="45" r="5" fill="#22c55e" />
                            <text x="140" y="80" fontFamily="Arial, sans-serif" fontSize="46" fontWeight="700" fill="currentColor">
                                TradeAlgo
                            </text>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
                    <p className="text-muted-foreground mt-1 mb-8">
                        Fill in the details below to get started
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="10-digit number"
                                    maxLength={10}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    required
                                    className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Referral Code (Optional)
                            </label>
                            <input
                                type="text"
                                name="referralCode"
                                value={formData.referralCode}
                                onChange={handleChange}
                                placeholder="Enter code"
                                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    toast.error("Google Sign Up Failed");
                                }}
                                useOneTap
                                theme="outline"
                                shape="rectangular"
                                width="100%"
                            />
                        </div>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
