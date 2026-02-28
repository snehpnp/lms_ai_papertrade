import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { GoogleLogin } from "@react-oauth/google";
import authService from "@/services/auth.service";
import { getAccessToken } from "@/lib/token";
import { decodeToken } from "@/lib/jwt";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      navigate(`/${user.role}/dashboard`);

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials";
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
      {/* Left - Branding */}
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
        // transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 border border-white/20 overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="/favicon.png" alt="Logo" className="w-12 h-12" />
          </motion.div>

          <motion.h1
            className="text-4xl font-extrabold text-foreground mb-4 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Welcome to TradeAlgo
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Master the markets with our comprehensive trading education
            platform. Learn, practice, and grow your trading skills risk-free.
          </motion.p>

          <motion.div
            className="mt-12 grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-sm">
              <p className="text-2xl font-bold tracking-tight text-primary">500+</p>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                Traders
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-sm">
              <p className="text-2xl font-bold tracking-tight text-blue-500">120+</p>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Courses</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-sm">
              <p className="text-2xl font-bold tracking-tight text-emerald-500">95%</p>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                Success
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="w-full max-w-md relative z-10"
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

          <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="text-muted-foreground mt-1 mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tradinglms.com"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error("Google Login Failed");
                }}
                useOneTap
                theme="outline"
                shape="rectangular"
                width="100%"
              />
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
