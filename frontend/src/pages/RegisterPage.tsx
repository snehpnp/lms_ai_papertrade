import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import authService from "@/services/auth.service";
import { getAccessToken } from "@/lib/token";
import { decodeToken } from "@/lib/jwt";
import { set } from "date-fns";

const RegisterPage = () => {
    const [name , setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  

  const [showOtpModal, setShowOtpModal] = useState(false);
const [otp, setOtp] = useState("");


  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name || !phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }


    setLoading(true);


    console.log(name, email, password, phoneNumber, referralCode);
    try {
      const user = await authService.register({
  name,
  email,
  password,
  phoneNumber, 
  referralCode,
});
 navigate("/login");
     

    } catch (error: any) {
  toast.error(error || "Invalid credentials");
}  finally {
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
            className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* <BarChart3 className="w-10 h-10 text-primary-foreground" /> */}
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
            Sign Up to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 ">

                <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

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


                <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
           Phone Number
              </label>
              <input
             type="tel"
  value={phoneNumber}
  onChange={(e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    setPhoneNumber(onlyNumbers);
  }}
                placeholder="xxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>


<div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      Referral Code
    </label>
    <input  
      type="text"
      value={referralCode}
      onChange={(e) => setReferralCode(e.target.value)}
      placeholder="Enter your referral code"
      className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
    />
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
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;



// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { BarChart3, Eye, EyeOff } from "lucide-react";
// import { toast } from "sonner";
// import { motion } from "motion/react";
// import authService from "@/services/auth.service";
// import { getAccessToken } from "@/lib/token";
// import { decodeToken } from "@/lib/jwt";
// import { set } from "date-fns";

// const RegisterPage = () => {
//     const [name , setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [ phoneNumber, setPhoneNumber] = useState("");
//   const [referralCode, setReferralCode] = useState("");
//   const [loading, setLoading] = useState(false);
  

//   const [showOtpModal, setShowOtpModal] = useState(false);
// const [otp, setOtp] = useState("");


//   const navigate = useNavigate();




//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!email || !password || !name || !phoneNumber) {
//       toast.error("Please fill in all fields");
//       return;
//     }


//     setLoading(true);


//     console.log(name, email, password, phoneNumber, referralCode);
//    try {
//   await authService.register({
//     name,
//     email,
//     password,
//     phoneNumber,
//     referralCode,
//   });

//   toast.success("OTP sent to your mobile");
//   setShowOtpModal(true);  
// } catch (error: any) {
//   toast.error(error || "Registration failed");
// }  finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       {/* Left - Branding */}
//       <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border/50">
//         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />

//         {/* Animated Background blobs */}
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//           className="absolute top-[10%] -right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
//           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//           className="absolute -bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px]"
//         />

//         <motion.div
//           className="relative z-10 text-center max-w-md"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//         // transition={{ duration: 0.8 }}
//         >
//           <motion.div
//             className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30"
//             whileHover={{ scale: 1.05, rotate: 5 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             {/* <BarChart3 className="w-10 h-10 text-primary-foreground" /> */}
//           </motion.div>

//           <motion.h1
//             className="text-4xl font-extrabold text-foreground mb-4 tracking-tight"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//           >
//             Welcome to TradeAlgo
//           </motion.h1>

//           <motion.p
//             className="text-lg text-muted-foreground leading-relaxed"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4, duration: 0.6 }}
//           >
//             Master the markets with our comprehensive trading education
//             platform. Learn, practice, and grow your trading skills risk-free.
//           </motion.p>

//           <motion.div
//             className="mt-12 grid grid-cols-3 gap-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6, duration: 0.6 }}
//           >
//             <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-sm">
//               <p className="text-2xl font-bold tracking-tight text-primary">500+</p>
//               <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
//                 Traders
//               </p>
//             </div>
//             <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-sm">
//               <p className="text-2xl font-bold tracking-tight text-blue-500">120+</p>
//               <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Courses</p>
//             </div>
//             <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-sm">
//               <p className="text-2xl font-bold tracking-tight text-emerald-500">95%</p>
//               <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
//                 Success
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>
//       </div>

//       {/* Right - Form */}
//       <motion.div
//         className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative"
//         initial={{ opacity: 0, x: 20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//       >
//         <motion.div
//           className="w-full max-w-md relative z-10"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.6 }}
//         >
//           {/* Mobile Logo */}
//           <div className="lg:hidden flex justify-center mb-8">
//             <svg width="240" height="50" viewBox="10 20 460 100" xmlns="http://www.w3.org/2000/svg">
//               <rect x="15" y="20" width="100" height="100" rx="22" fill="#0f172a" />
//               <polyline points="35,85 60,65 78,78 100,45" stroke="#22c55e" strokeWidth="5" fill="none" />
//               <circle cx="100" cy="45" r="5" fill="#22c55e" />
//               <text x="140" y="80" fontFamily="Arial, sans-serif" fontSize="46" fontWeight="700" fill="currentColor">
//                 TradeAlgo
//               </text>
//             </svg>
//           </div>

//           <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
//           <p className="text-muted-foreground mt-1 mb-8">
//             Sign Up to your account to continue
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-5 ">

//                 <div>
//               <label className="block text-sm font-medium text-foreground mb-1.5">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="John Doe"
//                 className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-foreground mb-1.5">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="admin@tradinglms.com"
//                 className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-1.5">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>
//             </div>


//                 <div>
//               <label className="block text-sm font-medium text-foreground mb-1.5">
//            Phone Number
//               </label>
//               <input
//              type="tel"
//   value={phoneNumber}
//   onChange={(e) => {
//     const onlyNumbers = e.target.value.replace(/\D/g, "");
//     setPhoneNumber(onlyNumbers);
//   }}
//                 placeholder="xxxxxxxxx"
//                 className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
//               />
//             </div>


// <div>
//     <label className="block text-sm font-medium text-foreground mb-1.5">
//       Referral Code
//     </label>
//     <input  
//       type="text"
//       value={referralCode}
//       onChange={(e) => setReferralCode(e.target.value)}
//       placeholder="Enter your referral code"
//       className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
//     />
//       </div>


//             <div className="flex items-center justify-between">
//               <label className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <input type="checkbox" className="rounded border-border" />
//                 Remember me
//               </label>
//               <a
//                 href="/forgot-password"
//                 className="text-sm text-primary hover:underline"
//               >
//                 Forgot password?
//               </a>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
//             >
//               {loading ? "Signing up..." : "Sign Up"}
//             </button>
//           </form>

//           <p className="text-center text-sm text-muted-foreground mt-6">
//             Already have an account?{" "}
//             <a
//               href="/login"
//               className="text-primary hover:underline font-medium"
//             >
//               Sign In
//             </a>
//           </p>
//         </motion.div>
//       </motion.div>


//       {showOtpModal && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//     <div className="bg-white p-6 rounded-xl w-[350px] shadow-lg">
//       <h3 className="text-lg font-semibold mb-4 text-center">
//         Enter OTP
//       </h3>

//       <input
//         type="text"
//         maxLength={6}
//         value={otp}
//         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//         className="w-full border px-3 py-2 rounded-md text-center tracking-widest text-lg"
//         placeholder="------"
//       />

//       <button
//         // onClick={handleVerifyOtp}
//         className="w-full mt-4 bg-primary text-white py-2 rounded-lg"
//       >
//         Verify OTP
//       </button>

//       <button
//         onClick={() => setShowOtpModal(false)}
//         className="w-full mt-2 text-sm text-gray-500"
//       >
//         Cancel
//       </button>
//     </div>
//   </div>
// )}



//     </div>
//   );
// };

// export default RegisterPage;
