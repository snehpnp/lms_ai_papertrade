import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, TrendingUp, ArrowRight, Zap, Target, Shield, ChevronRight, PlayCircle, BarChart3, Bot, LayoutDashboard, Mail, Phone, MapPin, Send, Calendar, User, Newspaper, LineChart } from "lucide-react";
import Lottie from "lottie-react";
import { publicService } from "@/services/public.service";

const LandingPage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await publicService.getCourses({ limit: 6 });
            if (data?.items) {
                setCourses(data.items);
            }
        } catch (error) {
            console.error("Failed to fetch public courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-hidden font-sans">
            {/* Navbar Minimal */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex  justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">

                <div className="flex items-center">
                    <svg width="240" height="45" viewBox="10 15 320 110" xmlns="http://www.w3.org/2000/svg" className="mt-1">
                        <rect x="15" y="20" width="100" height="100" rx="22" fill="#0f172a" />
                        <polyline points="35,85 60,65 78,78 100,45" stroke="#22c55e" strokeWidth="5" fill="none" />
                        <circle cx="100" cy="45" r="5" fill="#22c55e" />

                        <text x="135" y="70" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="700" fill="currentColor">
                            TradeAlgo LMS
                        </text>

                        <text x="135" y="105" fontFamily="Arial, sans-serif" fontSize="22" fill="currentColor" className="opacity-70">
                            Paper Trade Platform
                        </text>
                    </svg>
                </div>

                <div className="flex gap-4">
                    <Link
                        to="/login"
                        className="px-5 py-2 text-sm font-medium rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 border border-primary/20"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/login"
                        className="px-5 py-2 text-sm font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/25"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 min-h-[90vh]">
                {/* Hero Background Image */}


                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-sm">
                        <Zap className="w-4 h-4 mr-2 inline" /> Revolutionize Your Trading Journey
                    </Badge>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Master the Markets with <span className="text-primary">Next-Gen Intelligence</span>
                </motion.h1>

                {/* Hero Lottie Animation Placement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <HeroLottieAnimation />
                </motion.div>

                <motion.p
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Harness the power of cutting-edge AI for predictive trading and elevate your skills with comprehensive expert-led courses. Completely risk-free.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <button
                        onClick={handleNavigation}
                        className="px-8 flex items-center py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:scale-105"
                    >
                        Start Trading Now <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                    <button
                        onClick={() => document.getElementById("courses-section")?.scrollIntoView({ behavior: "smooth" })}
                        className="px-8 flex items-center py-4 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 transition-all border border-border"
                    >
                        Explore Courses <BookOpen className="ml-2 w-5 h-5" />
                    </button>
                </motion.div>

                {/* Floating AI Dash Mockup Preview */}
                <motion.div
                    className="mt-20 w-full max-w-5xl relative z-10 p-2 rounded-2xl bg-gradient-to-b from-border/50 to-transparent flex items-center justify-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="w-full bg-card rounded-xl border border-border overflow-hidden shadow-2xl flex flex-col items-center py-10 px-4">
                        <div className="flex gap-8 flex-wrap justify-center mb-6">
                            <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center min-w-[150px]">
                                <BarChart3 className="w-8 h-8 text-primary mb-2" />
                                <span className="font-bold">Real-time Data</span>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center min-w-[150px]">
                                <Bot className="w-8 h-8 text-blue-500 mb-2" />
                                <span className="font-bold">AI Analytics</span>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center min-w-[150px]">
                                <LayoutDashboard className="w-8 h-8 text-emerald-500 mb-2" />
                                <span className="font-bold">Virtual Portfolio</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-md">Get unparalleled insights from our AI engine processing millions of market data points per second.</p>
                    </div>
                </motion.div>
            </div>

            {/* Dynamic Courses Section */}
            <div id="courses-section" className="py-24 bg-muted/10 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Featured <span className="text-blue-500">Masterclasses</span></h2>
                            <p className="text-muted-foreground max-w-xl text-lg">
                                Discover courses crafted by market experts. Master strategies from absolute basics to advanced algorithmic trading.
                            </p>
                        </div>
                        <button onClick={handleNavigation} className="mt-4 md:mt-0 text-primary font-medium hover:underline flex items-center gap-1 group">
                            View All Courses <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-80 rounded-3xl bg-card border border-border animate-pulse" />
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    onClick={handleNavigation}
                                    className="group cursor-pointer flex flex-col overflow-hidden rounded-3xl bg-card border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                                >
                                    <div className="relative h-48 bg-muted overflow-hidden">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                                                <BookOpen className="w-12 h-12 text-primary/40" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <PlayCircle className="w-12 h-12 text-white shadow-lg rounded-full" />
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <h3 className="font-bold text-xl line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
                                                {course.title}
                                            </h3>
                                        </div>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                                            {course.description || "Learn the fundamentals and advanced topics to excel in this field with our comprehensive guide."}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                    {(course.subadmin?.name || "AD")[0]}
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">{course.subadmin?.name || "Expert Admin"}</span>
                                            </div>
                                            <span className="font-bold text-lg text-primary">
                                                {course.price > 0 ? `₹${course.price.toLocaleString()}` : 'Free'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-card rounded-3xl border border-border">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">No Courses Available</h3>
                            <p className="text-muted-foreground">Check back later for new expert-led content.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Outline */}
            <div className="py-24 border-t border-border/50">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center p-6 rounded-3xl bg-muted/30 border border-transparent hover:border-border hover:bg-card transition-all"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Precision AI Guidance</h4>
                        <p className="text-muted-foreground">Market sentiment and predictive analytics distilled into actionable intelligence straight to your dashboard.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center text-center p-6 rounded-3xl bg-muted/30 border border-transparent hover:border-border hover:bg-card transition-all"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                            <Shield className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Risk-Free Environment</h4>
                        <p className="text-muted-foreground">Simulate real markets using virtual currency. Validate your strategies without ever risking your capital.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center text-center p-6 rounded-3xl bg-muted/30 border border-transparent hover:border-border hover:bg-card transition-all"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                            <BookOpen className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Structured Learning Pathways</h4>
                        <p className="text-muted-foreground">Progressive modules taking you from absolute beginner concepts to advanced algorithmic patterns.</p>
                    </motion.div>
                </div>
            </div>

            {/* Extended Trading Information Section */}
            <div className="py-24 bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-l-full blur-3xl" />
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Master the Art of <br /><span className="text-primary">Paper Trading</span></h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Paper trading is the essential stepping stone to mastering financial markets. By simulating real-world trades using live market data without risking actual capital, you develop the psychological resilience and strategic edge needed for success.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><LineChart className="w-4 h-4 text-emerald-500" /></div>
                                <div>
                                    <h4 className="font-bold">Test Strategies Safely</h4>
                                    <p className="text-sm text-muted-foreground">Experiment with day trading, swing trading, or complex options strategies in a 100% risk-free sandbox.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-blue-500/20 p-1 rounded-full"><Bot className="w-4 h-4 text-blue-500" /></div>
                                <div>
                                    <h4 className="font-bold">AI-Assisted Analysis</h4>
                                    <p className="text-sm text-muted-foreground">Our algorithms provide real-time feedback on your mock trades, identifying patterns in your mistakes and successes.</p>
                                </div>
                            </li>
                        </ul>
                        <button onClick={handleNavigation} className="px-6 py-3 font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
                            Read the Trading Guide
                        </button>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                        <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-muted overflow-hidden border border-border shadow-2xl relative">
                            {/* Abstract Trading Chart / Visual */}
                            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted p-6 flex flex-col justify-end">
                                <div className="flex items-end gap-2 h-1/2 w-full opacity-50">
                                    {[40, 70, 45, 90, 65, 80, 50, 85, 60, 100].map((h, i) => (
                                        <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-between text-xs text-muted-foreground font-mono">
                                    <span>09:15 AM</span>
                                    <span>MARKET LIVE</span>
                                    <span>15:30 PM</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Blog Section */}
            <div className="py-24 bg-muted/20 border-t border-border/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20"><Newspaper className="w-3 h-3 mr-2" /> Latest Insights</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Trading <span className="text-blue-500">Blog</span></h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Stay updated with the latest market trends, trading strategies, and platform updates.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "5 Common Mistakes New Traders Make", category: "Education", readTime: "5 min read", date: "Oct 12, 2026", color: "text-blue-500", bg: "bg-blue-500/10", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800" },
                            { title: "How AI is Reshaping Algorithmic Trading", category: "Technology", readTime: "8 min read", date: "Oct 10, 2026", color: "text-primary", bg: "bg-primary/10", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800" },
                            { title: "Understanding Market Sentiment indicators", category: "Analysis", readTime: "6 min read", date: "Oct 05, 2026", color: "text-emerald-500", bg: "bg-emerald-500/10", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" }
                        ].map((blog, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                            >
                                <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
                                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-background/80 ${blog.color}`}>
                                        {blog.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex gap-4 text-xs text-muted-foreground mb-3 font-medium">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.date}</span>
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {blog.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">{blog.title}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                        Dive deep into expert analysis and discover actionable strategies to improve your portfolio performance today.
                                    </p>
                                    <button className="text-primary font-medium text-sm flex items-center group-hover:gap-2 gap-1 transition-all">
                                        Read Article <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="py-24 bg-card border-t border-border/50" id="contact">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Get in <span className="text-primary">Touch</span></h2>
                        <p className="text-muted-foreground mb-10 text-lg">
                            Have questions about our courses, AI tools, or need technical support? Our team of trading experts is here to help.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Email Us</p>
                                    <p className="font-bold text-lg">support@papertradeai.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Call Us</p>
                                    <p className="font-bold text-lg">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Headquarters</p>
                                    <p className="font-bold text-lg">Tech Hub, Cyber City, India</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-muted/30 p-8 rounded-3xl border border-border">
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNavigation() }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input type="email" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="How can we help you today?"></textarea>
                            </div>
                            <button className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                                Send Message <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="py-24 relative overflow-hidden flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to transform your trading?</h2>
                    <p className="text-xl text-muted-foreground mb-10">Join thousands of traders learning and simulating strategies in a single, powerful platform.</p>
                    <button
                        onClick={handleNavigation}
                        className="px-10 py-5 bg-foreground text-background font-bold rounded-full hover:bg-foreground/90 hover:scale-105 transition-all text-lg shadow-2xl"
                    >
                        Configure Your Free Account Now
                    </button>
                </div>
            </div>

            {/* Extended Footer */}
            <footer className="bg-card border-t border-border/50 py-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-6">
                            <svg width="200" height="40" viewBox="10 15 320 110" xmlns="http://www.w3.org/2000/svg">
                                <rect x="15" y="20" width="100" height="100" rx="22" fill="#0f172a" />
                                <polyline points="35,85 60,65 78,78 100,45" stroke="#22c55e" strokeWidth="5" fill="none" />
                                <circle cx="100" cy="45" r="5" fill="#22c55e" />
                                <text x="135" y="70" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="700" fill="currentColor">TradeAlgo LMS</text>
                                <text x="135" y="105" fontFamily="Arial, sans-serif" fontSize="22" fill="currentColor" className="opacity-70">Paper Trade Platform</text>
                            </svg>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-sm mb-6">
                            Master the markets risk-free with our cutting-edge AI simulator and expert-led masterclasses. The ultimate environment for your trading journey.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer text-muted-foreground"><TrendingUp className="w-4 h-4" /></div>
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer text-muted-foreground"><Newspaper className="w-4 h-4" /></div>
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer text-muted-foreground"><BookOpen className="w-4 h-4" /></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><p className="hover:text-primary transition-colors cursor-pointer">AI Trading Simulator</p></li>
                            <li><p className="hover:text-primary transition-colors cursor-pointer">Masterclass Courses</p></li>
                            <li><p className="hover:text-primary transition-colors cursor-pointer">Market Analytics</p></li>
                            <li><p className="hover:text-primary transition-colors cursor-pointer">Pricing & Plans</p></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><p className="hover:text-primary transition-colors cursor-pointer">About Us</p></li>
                            <li><p className="hover:text-primary transition-colors cursor-pointer">Contact Support</p></li>
                            <li><p className="hover:text-primary transition-colors cursor-pointer">Careers</p></li>
                            <li><p className="hover:text-primary transition-colors cursor-pointer">Privacy Policy & Terms</p></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} TradeAlgo LMS. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Empowering the next generation of algorithmic thinkers.</p>
                </div>
            </footer>
        </div>
    );
};

// Hero Lottie floating animation
const HeroLottieAnimation = () => {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        // Fetching a free financial/trading Lottie animation JSON
        fetch("https://lottie.host/80dc3d02-1875-4c07-ba95-714041d8dff7/k5aXf3r25C.json")
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Could not load lottie", err));
    }, []);

    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mx-auto mb-10">
            {/* Glow / Aura behind the Lottie to keep the magical vibe */}
            <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full mix-blend-screen" />
            <div className="absolute inset-4 bg-emerald-500/20 blur-[40px] rounded-full mix-blend-screen" />
            <div className="relative z-10 w-full h-full drop-shadow-2xl">
                {animationData ? (
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        className="w-full h-full"
                        style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))" }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary animate-pulse">
                        <BookOpen className="w-24 h-24 opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
};

// Component helper for Badge
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
        {children}
    </span>
);

export default LandingPage;
