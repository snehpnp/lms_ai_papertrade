import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import WatchlistSidebar from "../trading/WatchlistSidebar";
import ModeToggleFab from "../common/ModeToggleFab";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/store/watchlistStore";

const TradingLayout = () => {
    const location = useLocation();
    const { selectedItem } = useWatchlistStore();
    const isWatchlistPath = location.pathname === "/user/paper-trade/watchlist";

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
            {/* Header - Fixed height */}
            <AppHeader sidebarCollapsed={true} onToggleSidebar={() => { }} />

            {/* Main Layout - Takes remaining height */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Persistent Watchlist Sidebar */}
                <div className={cn(
                    "shrink-0 transition-all duration-300",
                    // On desktop: always show
                    "md:block",
                    // On mobile: 
                    // 1. Show only on watchlist path
                    // 2. Hide if a symbol is selected (to show the chart/page content instead)
                    isWatchlistPath && !selectedItem ? "block w-full" : "hidden",
                )}>
                    <WatchlistSidebar />
                </div>

                {/* Page Content */}
                <main className={cn(
                    "flex-1 overflow-y-auto no-scrollbar relative bg-muted/5 p-3 md:p-6 pb-24 md:pb-6",
                    // On mobile: hide page content if we are showing the list
                    isWatchlistPath && !selectedItem ? "hidden md:block" : "block"
                )}>
                    <Outlet />
                    <ModeToggleFab />
                    <MobileBottomNav />
                </main>
            </div>
        </div>
    );
};

export default TradingLayout;
