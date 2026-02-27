import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import WatchlistSidebar from "../trading/WatchlistSidebar";
import { cn } from "@/lib/utils";

const TradingLayout = () => {
    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header - Fixed height */}
            <AppHeader sidebarCollapsed={true} onToggleSidebar={() => { }} />

            {/* Main Layout - Takes remaining height */}
            <div className="flex flex-1 overflow-hidden">
                {/* Persistent Watchlist Sidebar */}
                <WatchlistSidebar />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar relative bg-muted/5 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TradingLayout;
