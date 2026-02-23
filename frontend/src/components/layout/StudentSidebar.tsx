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
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
  { title: "My Courses", icon: BookOpen, path: "/student/courses" },
  { title: "Paper Trade", icon: CandlestickChart, path: "/student/paper-trade" },
  { title: "Profile", icon: User, path: "/student/profile" },
];

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const StudentSidebar = ({ collapsed, onToggle }: StudentSidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col sidebar-transition border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sidebar-primary-foreground font-semibold text-sm whitespace-nowrap">
              Trading LMS
            </span>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-4 h-4 text-sidebar-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">
                {user?.name || "Student"}
              </p>
              <p className="text-xs text-sidebar-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {studentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
