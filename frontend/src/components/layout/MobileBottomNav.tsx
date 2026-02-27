import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { LayoutDashboard, BookOpen, GraduationCap, CreditCard, Activity, ListOrdered, Wallet, Eye } from "lucide-react";

const MobileBottomNav = () => {
    const location = useLocation();
    const { userProfile } = useProfileStore();

    const learningMenu = [
        { title: "Courses", icon: BookOpen, path: "/user/courses" },
        { title: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
        { title: "Exercises", icon: GraduationCap, path: "/user/exercises" },
        { title: "Wallet", icon: CreditCard, path: "/user/transactions" },
    ];

    const tradingMenu = [
        { title: "Watchlist", icon: Eye, path: "/user/paper-trade/watchlist" },

        { title: "Positions", icon: Activity, path: "/user/paper-trade/positions" },
        { title: "Dashboard", icon: LayoutDashboard, path: "/user/paper-trade/dashboard" },
        { title: "Orders", icon: ListOrdered, path: "/user/paper-trade/orders" },
        { title: "Wallet", icon: Wallet, path: "/user/paper-trade/wallet" },
    ];

    const menuItems = userProfile?.isLearningMode ? learningMenu : tradingMenu;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border px-2 pb-safe-area-inset-bottom">
            <nav className="flex items-center justify-around h-16">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-xl transition-all duration-300",
                                isActive ? "bg-primary/10 scale-110" : "bg-transparent"
                            )}>
                                <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-tighter transition-all",
                                isActive ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0.5"
                            )}>
                                {item.title === "Transactions" ? "Wallet" : item.title}
                            </span>

                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileBottomNav;
