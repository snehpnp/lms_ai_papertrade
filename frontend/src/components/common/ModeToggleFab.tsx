import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, CandlestickChart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ModeToggleFab = () => {
    const { userProfile, toggleMode } = useProfileStore();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after 100px scroll
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        // Initial check for pages that are already scrolled or small
        if (window.innerHeight < document.body.scrollHeight) {
            // If page is scrollable, wait for scroll
        } else {
            // If page is not scrollable, show it anyway? 
            // The user specifically asked for "when user scroll kare tab aae"
            // But maybe they want it always if the page is short?
            // Let's stick to scroll for now or always show if not at top.
        }

        // Always show on Paper Trading pages because they are often overflow-hidden/h-screen
        if (window.location.pathname.includes("paper-trade")) {
            setIsVisible(true);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleToggle = async () => {
        const newMode = !userProfile?.isLearningMode;
        await toggleMode();
        if (newMode) {
            navigate("/user/dashboard");
        } else {
            navigate("/user/paper-trade/dashboard");
        }
    };

    const isLearning = userProfile?.isLearningMode;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="fixed bottom-24 md:bottom-6 right-6 z-50 flex items-center gap-2"
                >
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-card border border-border px-4 py-2 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap"
                            >
                                Switch to {isLearning ? "Paper Trading" : "Learning Mode"}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={handleToggle}
                        className={cn(
                            "h-14 w-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0 relative overflow-hidden group transition-all duration-500",
                            isLearning
                                ? "bg-gradient-to-br from-indigo-600 to-violet-600 hover:shadow-indigo-500/20"
                                : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-500/20"
                        )}
                    >
                        {/* Animated background rings */}
                        <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-150 rounded-full transition-transform duration-700 opacity-0 group-hover:opacity-100" />

                        <div className="relative z-10 flex items-center justify-center">
                            {isLearning ? (
                                <Zap className="w-6 h-6 text-white animate-pulse" />
                            ) : (
                                <GraduationCap className="w-6 h-6 text-white" />
                            )}
                        </div>

                        {/* Status Dot */}
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModeToggleFab;
