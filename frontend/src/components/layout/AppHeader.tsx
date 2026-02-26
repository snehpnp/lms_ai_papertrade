import { Search, Bell, ChevronDown, LogOut, User, KeyRound, Menu, CandlestickChart, GraduationCap, Sun, Moon, Link2, Share2, LayoutDashboard, BookOpen, CreditCard, Eye, Zap, Activity, ListOrdered, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { Switch } from "@/components/ui/switch";
import { useUserStream } from "@/hooks/useUserStream";

interface AppHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const AppHeader = ({ sidebarCollapsed, onToggleSidebar }: AppHeaderProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { userProfile, fetchProfile } = useProfileStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const learningMenu = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
    { title: "My Courses", icon: BookOpen, path: "/user/courses" },
    { title: "Exercises", icon: GraduationCap, path: "/user/exercises" },
    { title: "Transactions", icon: CreditCard, path: "/user/transactions" },
  ];

  const tradingMenu = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/user/paper-trade/dashboard" },
    { title: "Watchlist", icon: Eye, path: "/user/paper-trade/watchlist" },
    // { title: "Trade", icon: Zap, path: "/user/paper-trade/trade" },
    { title: "Positions", icon: Activity, path: "/user/paper-trade/positions" },
    { title: "Orders", icon: ListOrdered, path: "/user/paper-trade/orders" },
    { title: "Wallet", icon: Wallet, path: "/user/paper-trade/wallet" },
  ];

  const menuItems = userProfile?.isLearningMode ? learningMenu : tradingMenu;

  // Maintain persistent live connection for Admin modifications
  useUserStream();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-card flex items-center justify-between px-4 md:px-6 sidebar-transition border-b border-border shadow-sm",
        user?.role === "user" ? "left-0" : (sidebarCollapsed ? "left-0 md:left-[68px]" : "left-0 md:left-[240px]")
      )}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        {user?.role !== "user" && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo for Students */}
        {user?.role === "user" && (
          <Link to="/" className="flex items-center shrink-0 mr-2 md:mr-4">
            <svg width="180" height="40" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
              <rect x="15" y="20" width="100" height="100" rx="22" fill="#0f172a" />
              <polyline points="35,85 60,65 78,78 100,45" stroke="#22c55e" strokeWidth="6" fill="none" />
              <circle cx="100" cy="45" r="5" fill="#22c55e" />
              <text x="140" y="70" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="800" fill="currentColor">
                TradeAlgo LMS
              </text>
              <text x="140" y="105" fontFamily="Arial, sans-serif" fontSize="22" fill="currentColor" opacity="0.6">
                Paper Trade Platform
              </text>
            </svg>
          </Link>
        )}

        {/* Student Navigation Links */}
        {user?.role === "user" && (
          <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-2 -mb-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline-block">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {user?.role !== "user" && <div className="hidden lg:block w-full max-w-xs ml-2">
          {/* ... existing search or something ... */}
        </div>}
      </div>

      <div className="flex items-center gap-3">
        {/* Mode Toggle for Students */}
        {user?.role === "user" && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/50 border border-border mr-2">
            <div className={cn(
              "p-1 rounded-full transition-colors",
              !userProfile?.isLearningMode ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}>
              <CandlestickChart className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="mode-toggle"
                checked={userProfile?.isLearningMode || false}
                onCheckedChange={async (checked) => {
                  await useProfileStore.getState().toggleMode();
                  if (checked) {
                    navigate("/user/dashboard");
                  } else {
                    navigate("/user/paper-trade/dashboard");
                  }
                }}
              />
            </div>

            <div className={cn(
              "p-1 rounded-full transition-colors",
              userProfile?.isLearningMode ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}>
              <GraduationCap className="w-3.5 h-3.5" />
            </div>

            <span className="text-[10px] uppercase tracking-wider hidden lg:block">
              {userProfile?.isLearningMode ? "Learning" : "Trading"}
            </span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-loss" />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="text-sm text-foreground hidden sm:block">
              {userProfile?.name || user?.name || "User"}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl border border-border shadow-lg py-1 animate-fade-in">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate(`/${user?.role}/profile`);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </button>

              {(user?.role === "admin" || user?.role === "subadmin") && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`/${user?.role}/refer`);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Refer & Earn
                </button>
              )}

              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`/${user?.role}/settings`);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Settings
                </button>
              )}

              {user?.role === "user" && userProfile?.referredBy?.brokerRedirectUrl && (
                <a
                  href={userProfile.referredBy.brokerRedirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors font-medium"
                >
                  <Link2 className="w-4 h-4" /> Connect to Broker
                </a>
              )}

              <hr className="my-1 border-border" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-loss-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
