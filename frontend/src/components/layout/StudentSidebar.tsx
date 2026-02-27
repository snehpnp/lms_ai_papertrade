import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CandlestickChart,
  Lightbulb,
  CreditCard,
  Eye,
  Zap,
  Activity,
  ListOrdered,
  History,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";

const baseMenu = [
  // { title: "Profile", icon: User, path: "/user/profile" },
];

const learningMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
  { title: "My Courses", icon: BookOpen, path: "/user/courses" },
  { title: "Exercise Logs", icon: GraduationCap, path: "/user/exercises" },
  { title: "Transactions", icon: CreditCard, path: "/user/transactions" },
];

const tradingMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/user/paper-trade/dashboard" },
  // { title: "Watchlist", icon: Eye, path: "/user/paper-trade/watchlist" },
  // { title: "Trade", icon: Zap, path: "/user/paper-trade/trade" },
  { title: "Positions", icon: Activity, path: "/user/paper-trade/positions" },
  { title: "Orders", icon: ListOrdered, path: "/user/paper-trade/orders" },
  // { title: "History", icon: History, path: "/user/paper-trade/history" },
  { title: "Wallet", icon: Wallet, path: "/user/paper-trade/wallet" },
];

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const StudentSidebar = ({ collapsed, onToggle }: StudentSidebarProps) => {
  const { user } = useAuth();
  const { userProfile } = useProfileStore();
  const location = useLocation();

  const menuItems = userProfile?.isLearningMode
    ? [...baseMenu.slice(0, 1), ...learningMenu, ...baseMenu.slice(1)]
    : [...baseMenu.slice(0, 1), ...tradingMenu, ...baseMenu.slice(1)];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col sidebar-transition border-r border-sidebar-border shadow-xl md:shadow-none",
        collapsed ? "-translate-x-full md:translate-x-0 md:w-[68px]" : "translate-x-0 w-[240px] md:w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-sidebar-border overflow-hidden">
        <Link to="/" className="flex items-center w-full h-full">
          {!collapsed ? (
            <svg width="520" height="140" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="20" width="100" height="100" rx="22" fill="#0f172a" />

              <polyline points="35,85 60,65 78,78 100,45" stroke="#22c55e" strokeWidth="5" fill="none" />
              <circle cx="100" cy="45" r="5" fill="#22c55e" />

              <text x="140" y="70" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="700" fill="currentColor">
                TradeAlgo LMS
              </text>

              <text x="140" y="100" fontFamily="Arial, sans-serif" fontSize="22" fill="currentColor" opacity="0.6">
                Paper Trade Platform
              </text>
            </svg>
          ) : (
            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="14" fill="#0f172a" />
              <polyline points="14,40 26,30 36,36 48,18" stroke="#22c55e" strokeWidth="3" fill="none" />
            </svg>
          )}
        </Link>
      </div>



      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {!collapsed && (
          <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-2">
            Main Pages
          </p>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      {/* <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div> */}
    </aside>
  );
};

export default StudentSidebar;
