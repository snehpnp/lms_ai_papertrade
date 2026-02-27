import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import WatchlistSidebar from "../trading/WatchlistSidebar";
import ModeToggleFab from "../common/ModeToggleFab";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";

const TradingLayout = () => {
    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header - Fixed height */}
            <AppHeader sidebarCollapsed={true} onToggleSidebar={() => { }} />

            {/* Main Layout - Takes remaining height */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Persistent Watchlist Sidebar - Hidden on mobile, shown on md+ */}
                <div className="hidden md:block shrink-0">
                    <WatchlistSidebar />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar relative bg-muted/5 p-3 md:p-6 pb-20 md:pb-6">
                    <Outlet />
                    <ModeToggleFab />
                    <MobileBottomNav />
                </main>
            </div>
        </div>
    );
};

export default TradingLayout;
