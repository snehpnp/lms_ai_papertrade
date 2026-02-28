import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    BookOpen, TrendingUp, ArrowRight, Zap, Target, Shield,
    ChevronRight, PlayCircle, BarChart3, Bot, LayoutDashboard,
    Mail, Phone, MapPin, Send, Calendar, Newspaper, LineChart,
    Award, Users, GraduationCap, Cpu, Sparkles, Activity,
    Sun, Moon, Menu, X
} from "lucide-react";
import { publicService } from "@/services/public.service";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import LandingMascot from "@/components/common/LandingMascot";
import { MascotExpression } from "@/components/common/TradingMascot";
import "./LandingPage.css";

/* ─────────────── MAIN COMPONENT ─────────────── */
const LandingPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { branding } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await publicService.getCourses({ limit: 6 });
            if (data?.items) setCourses(data.items);
        } catch (error) {
            console.error("Failed to fetch public courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const goLogin = () => navigate("/login");

    const chartBarHeights = [35, 55, 40, 72, 58, 85, 48, 90, 62, 78, 45, 95, 52, 68, 80];

    return (
        <div className={`landing-root ${theme === "light" ? "lp-light" : ""}`}>
            {/* ━━━ NAVBAR ━━━ */}
            <nav className="lp-nav">
                <Link to="/" className="lp-nav-logo group flex items-center gap-2">
                    <motion.div whileHover={{ rotate: 15 }} className="hidden sm:block">
                        <MascotExpression mood="happy" size={32} />
                    </motion.div>
                    <img src={branding.appLogo} alt={branding.appName} className="h-8 w-auto" />
                </Link>
                <div className={`lp-nav-links ${mobileMenuOpen ? "active" : ""}`}>
                    <a href="#features" className="lp-btn-ghost" onClick={() => setMobileMenuOpen(false)}>Features</a>
                    <a href="#courses-section" className="lp-btn-ghost" onClick={() => setMobileMenuOpen(false)}>Courses</a>
                    <a href="#contact" className="lp-btn-ghost" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                    <div className="lp-nav-divider hidden md:block" />
                    <button onClick={toggleTheme} className="lp-theme-toggle" aria-label="Toggle theme">
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <Link to="/login" className="lp-btn-ghost">Sign In</Link>
                    <Link to="/login" className="lp-btn-primary">Get Started</Link>
                </div>

                <button
                    className="lp-mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* ━━━ HERO ━━━ */}
            <section className="lp-hero">
                <div className="lp-hero-glow-1" />
                <div className="lp-hero-glow-2" />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="lp-hero-badge">
                        <Zap size={14} /> Revolutionize Your Trading Journey
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Master the Markets with{" "}
                    <span className="accent">Next-Gen Intelligence</span>
                </motion.h1>

                <motion.p
                    className="lp-hero-sub"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Harness cutting-edge AI for predictive trading insights and elevate your skills with expert-led courses. Completely risk-free.
                </motion.p>

                <motion.div
                    className="lp-hero-actions flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <button
                        onClick={goLogin}
                        className="lp-btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        Start Trading Now <ArrowRight size={14} />
                    </button>

                    <button
                        onClick={() =>
                            document
                                .getElementById("courses-section")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="lp-btn-outline flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <BookOpen size={18} /> Explore Courses
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    className="lp-hero-preview animate-mascot-float"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="lp-preview-topbar relative">
                        <div className="flex items-center gap-2">
                            <div className="lp-preview-dot" style={{ background: "#FF5F57" }} />
                            <div className="lp-preview-dot" style={{ background: "#FEBC2E" }} />
                            <div className="lp-preview-dot" style={{ background: "#28C840" }} />
                        </div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: [0, -4, 0], opacity: 1 }}
                            transition={{ delay: 1, duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute right-6 -top-12 z-10 drop-shadow-2xl hidden sm:block pointer-events-none"
                        >
                            <MascotExpression mood="winking" size={70} />
                        </motion.div>
                    </div>
                    <div className="lp-preview-content">
                        <div className="lp-preview-stat">
                            <span className="lp-preview-stat-label">Portfolio Value</span>
                            <span className="lp-preview-stat-value">₹12,45,800</span>
                        </div>
                        <div className="lp-preview-stat">
                            <span className="lp-preview-stat-label">Today's P&L</span>
                            <span className="lp-preview-stat-value" style={{ color: "#22C55E" }}>+₹8,420</span>
                        </div>
                        <div className="lp-preview-stat">
                            <span className="lp-preview-stat-label">AI Confidence</span>
                            <span className="lp-preview-stat-value" style={{ color: "#FF7100" }}>94.2%</span>
                        </div>
                        <div className="lp-preview-chart">
                            {chartBarHeights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="lp-chart-bar"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ━━━ STATS BANNER ━━━ */}
            <div className="lp-stats-banner">
                {[
                    { value: "50K+", label: "Active Traders", color: "#FF7100" },
                    { value: "₹200Cr+", label: "Paper Money Traded", color: "#FF8F40" },
                    { value: "500+", label: "Expert Courses", color: "#22C55E" },
                    { value: "98.5%", label: "User Satisfaction", color: "#F59E0B" },
                ].map((s, i) => (
                    <motion.div
                        key={i} className="lp-stat-item group hover:-translate-y-2 transition-transform duration-300 relative"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="value" style={{ color: s.color }}>{s.value}</div>
                        <div className="label">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ━━━ FEATURES ━━━ */}
            <section id="features" className="lp-section lp-divider">
                <div className="lp-section-inner">
                    <div className="lp-section-header">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Everything you need to{" "}
                            <span className="accent">trade smarter</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            A unified platform combining AI analytics, structured learning, and risk-free simulation.
                        </motion.p>
                    </div>
                    <div className="lp-features-grid">
                        {[
                            { icon: <Target size={22} />, cls: "purple", title: "Precision AI Guidance", desc: "Market sentiment and predictive analytics distilled into actionable intelligence on your dashboard." },
                            { icon: <Shield size={22} />, cls: "green", title: "Risk-Free Sandbox", desc: "Simulate real markets with virtual currency. Validate strategies without risking your capital." },
                            { icon: <BookOpen size={22} />, cls: "cyan", title: "Structured Pathways", desc: "Progressive modules from absolute beginner concepts to advanced algorithmic trading patterns." },
                            { icon: <Cpu size={22} />, cls: "purple", title: "Algorithmic Strategies", desc: "Build, backtest, and deploy your own trading algorithms with our advanced toolkit." },
                            { icon: <Activity size={22} />, cls: "green", title: "Real-time Analytics", desc: "Live market data, performance heatmaps, and portfolio analytics updated every second." },
                            { icon: <Award size={22} />, cls: "cyan", title: "Leaderboard Ranking", desc: "Compete with thousands of traders. Earn badges and climb the performance leaderboard." },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                className="lp-feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className={`lp-feature-icon ${f.cls}`}>{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ COURSES ━━━ */}
            <section id="courses-section" className="lp-section lp-divider">
                <div className="lp-section-inner">
                    <div className="lp-courses-header">
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.1 }}
                            >
                                Featured <span className="accent">Masterclasses</span>
                            </motion.h2>
                            <p style={{ color: "#9CA3AF", fontSize: 16, maxWidth: 480, lineHeight: 1.7, margin: 0 }}>
                                Expert-crafted courses from market basics to advanced algorithmic trading.
                            </p>
                        </div>
                        <button onClick={goLogin} className="lp-view-all">
                            View All Courses <ChevronRight size={16} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="lp-courses-grid">
                            {[1, 2, 3].map(i => <div key={i} className="lp-course-skeleton" />)}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="lp-courses-grid">
                            {courses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    className="lp-course-card"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.08 }}
                                    onClick={goLogin}
                                >
                                    <div className="lp-course-thumb">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} />
                                        ) : (
                                            <div className="lp-course-thumb-placeholder">
                                                <BookOpen size={40} color="rgba(255,113,0,0.35)" />
                                            </div>
                                        )}
                                        <div className="lp-course-overlay">
                                            <PlayCircle size={44} color="#fff" />
                                        </div>
                                    </div>
                                    <div className="lp-course-body">
                                        <h3 className="lp-course-title">{course.title}</h3>
                                        <p className="lp-course-desc">
                                            {course.description || "Learn fundamentals and advanced topics to excel in this field with our comprehensive guide."}
                                        </p>
                                        <div className="lp-course-footer">
                                            <div className="lp-course-author">
                                                <div className="lp-course-avatar">
                                                    {(course.subadmin?.name || "AD")[0]}
                                                </div>
                                                <span className="lp-course-author-name">
                                                    {course.subadmin?.name || "Expert Admin"}
                                                </span>
                                            </div>
                                            <span className="lp-course-price">
                                                {course.price > 0 ? `₹${course.price.toLocaleString()}` : "Free"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "80px 20px", background: "#111118", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                            <BookOpen size={40} color="#64748B" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Courses Available</h3>
                            <p style={{ color: "#9CA3AF" }}>Check back later for new expert-led content.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ━━━ TRADING PREVIEW ━━━ */}
            <section className="lp-section lp-trading-section lp-divider">
                <div className="lp-section-inner">
                    <div className="lp-trading-grid">
                        <motion.div
                            className="lp-trading-text"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
                                Master the Art of{" "}
                                <span style={{ color: "#FF7100" }}>Paper Trading</span>
                            </h2>
                            <p>
                                Paper trading is the essential stepping stone to mastering financial markets. Simulate real-world trades using live data without risking actual capital.
                            </p>
                            <ul className="lp-trading-list">
                                <li>
                                    <div className="lp-trading-list-icon" style={{ background: "rgba(34,197,94,0.12)" }}>
                                        <LineChart size={16} color="#22C55E" />
                                    </div>
                                    <div>
                                        <h4>Test Strategies Safely</h4>
                                        <p>Experiment with day trading, swing trading, or complex options strategies in a 100% risk-free sandbox.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="lp-trading-list-icon" style={{ background: "rgba(255,143,64,0.12)" }}>
                                        <Bot size={16} color="#FF8F40" />
                                    </div>
                                    <div>
                                        <h4>AI-Assisted Analysis</h4>
                                        <p>Our algorithms provide real-time feedback, identifying patterns in your mistakes and successes.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="lp-trading-list-icon" style={{ background: "rgba(255,113,0,0.12)" }}>
                                        <Sparkles size={16} color="#FF7100" />
                                    </div>
                                    <div>
                                        <h4>Performance Insights</h4>
                                        <p>Detailed analytics on win rate, risk/reward ratio, and portfolio allocation visualized beautifully.</p>
                                    </div>
                                </li>
                            </ul>
                            <button onClick={goLogin} className="lp-btn-primary" style={{ padding: "14px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                                Start Paper Trading <ArrowRight size={16} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="lp-trading-visual">
                                <div className="lp-trading-visual-header">
                                    <span>NIFTY 50 — Portfolio Performance</span>
                                    <span className="live">MARKET LIVE</span>
                                </div>
                                <div className="lp-trading-bars">
                                    {[40, 70, 45, 90, 65, 80, 50, 85, 60, 100, 55, 75].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="lp-trading-bar"
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                        />
                                    ))}
                                </div>
                                <div className="lp-trading-footer">
                                    <span>09:15 AM</span>
                                    <span>PAPER TRADING SESSION</span>
                                    <span>15:30 PM</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━ BLOG ━━━ */}
            <section className="lp-section lp-divider">
                <div className="lp-section-inner">
                    <div className="lp-section-header">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Trading <span className="accent-cyan">Blog</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Market trends, trading strategies, and platform updates.
                        </motion.p>
                    </div>
                    <div className="lp-blog-grid">
                        {[
                            { title: "5 Common Mistakes New Traders Make", cat: "Education", catColor: "#FF8F40", time: "5 min", date: "Oct 12, 2026", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800" },
                            { title: "How AI is Reshaping Algorithmic Trading", cat: "Technology", catColor: "#FF7100", time: "8 min", date: "Oct 10, 2026", img: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800" },
                            { title: "Understanding Market Sentiment Indicators", cat: "Analysis", catColor: "#22C55E", time: "6 min", date: "Oct 05, 2026", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" },
                        ].map((b, i) => (
                            <motion.div
                                key={i}
                                className="lp-blog-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="lp-blog-thumb">
                                    <img src={b.img} alt={b.title} />
                                    <span className="lp-blog-tag" style={{ color: b.catColor }}>{b.cat}</span>
                                </div>
                                <div className="lp-blog-body">
                                    <div className="lp-blog-meta">
                                        <span><Calendar size={12} /> {b.date}</span>
                                        <span><BookOpen size={12} /> {b.time} read</span>
                                    </div>
                                    <h3>{b.title}</h3>
                                    <p>Dive deep into expert analysis and discover actionable strategies to improve your portfolio performance.</p>
                                    <button className="lp-blog-read-more">
                                        Read Article <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ CONTACT ━━━ */}
            <section id="contact" className="lp-section lp-divider" style={{ background: "#111118" }}>
                <div className="lp-section-inner">
                    <div className="lp-contact-grid">
                        <motion.div className="lp-contact-info" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
                                Get in <span style={{ color: "#FF7100" }}>Touch</span>
                            </h2>
                            <p>Have questions about our courses, AI tools, or need technical support? Our team of trading experts is here to help.</p>
                            <div className="lp-contact-items">
                                {[
                                    { icon: <Mail size={20} />, bg: "rgba(255,113,0,0.12)", lbl: "Email Us", val: "support@papertradeai.com" },
                                    { icon: <Phone size={20} />, bg: "rgba(255,143,64,0.12)", lbl: "Call Us", val: "+91 98765 43210" },
                                    { icon: <MapPin size={20} />, bg: "rgba(34,197,94,0.12)", lbl: "Headquarters", val: "Tech Hub, Cyber City, India" },
                                ].map((c, i) => (
                                    <div key={i} className="lp-contact-item">
                                        <div className="lp-contact-icon-wrap" style={{ background: c.bg }}>{c.icon}</div>
                                        <div>
                                            <span>{c.lbl}</span>
                                            <strong>{c.val}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <form className="lp-contact-form" onSubmit={e => { e.preventDefault(); goLogin(); }}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" placeholder="John" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="john@example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea rows={4} placeholder="How can we help you today?" />
                                </div>
                                <button type="submit" className="lp-contact-submit">
                                    Send Message <Send size={16} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━ CTA ━━━ */}
            <section className="lp-cta lp-divider">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ position: "relative" }}
                >
                    Ready to transform your trading?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    style={{ position: "relative" }}
                >
                    Join thousands learning and simulating strategies in a single, powerful platform.
                </motion.p>
                <motion.button
                    onClick={goLogin}
                    className="lp-cta-button"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Configure Your Free Account <ArrowRight size={18} />
                </motion.button>
            </section>

            {/* ━━━ FOOTER ━━━ */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-grid">
                        <div className="lp-footer-brand">
                            <Link to="/" className="lp-nav-logo" style={{ marginBottom: 0 }}>
                                <img src={branding.appLogo} alt={branding.appName} className="h-6 w-auto" />
                            </Link>
                            <p>Master the markets risk-free with our cutting-edge AI simulator and expert-led masterclasses. The ultimate environment for your trading journey.</p>
                            <div className="lp-footer-socials">
                                <div className="lp-footer-social"><TrendingUp size={14} /></div>
                                <div className="lp-footer-social"><Newspaper size={14} /></div>
                                <div className="lp-footer-social"><BookOpen size={14} /></div>
                            </div>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Platform</h4>
                            <ul>
                                <li>AI Trading Simulator</li>
                                <li>Masterclass Courses</li>
                                <li>Market Analytics</li>
                                <li>Pricing & Plans</li>
                            </ul>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Company</h4>
                            <ul>
                                <li>About Us</li>
                                <li>Contact Support</li>
                                <li>Careers</li>
                                <li>Privacy & Terms</li>
                            </ul>
                        </div>
                    </div>
                    <div className="lp-footer-bottom">
                        <span>© {new Date().getFullYear()} {branding.appName}. All rights reserved.</span>
                        <span>Empowering the next generation of algorithmic thinkers.</span>
                    </div>
                </div>
            </footer>

            <LandingMascot />
        </div>
    );
};

export default LandingPage;
