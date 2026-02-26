import { Search, Bell, ChevronDown, LogOut, User, KeyRound, Menu, CandlestickChart, GraduationCap, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log("userProfile", userProfile?.isLearningMode, userProfile?.isPaperTradeDefault)

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
        "fixed top-0 right-0 z-30 h-16 bg-card  flex items-center justify-between px-4 md:px-6 sidebar-transition",
        sidebarCollapsed ? "left-0 md:left-[68px]" : "left-0 md:left-[240px]"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 rounded-lg bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode Toggle for Students */}
        {(user?.role === "user" && (userProfile?.isLearningMode && userProfile?.isPaperTradeDefault)) && (
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
              {user?.role === "admin" && <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate(`/${user?.role}/settings`);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <KeyRound className="w-4 h-4" /> settings
              </button>}
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
