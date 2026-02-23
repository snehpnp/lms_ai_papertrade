import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  FileText,
  HelpCircle,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "SubAdmins", icon: UserCog, path: "/admin/subadmins" },
  { title: "Courses", icon: BookOpen, path: "/admin/courses" },
  { title: "Lessons", icon: FileText, path: "/admin/lessons" },
  { title: "Quiz", icon: HelpCircle, path: "/admin/quiz" },
  { title: "Trade Analytics", icon: BarChart3, path: "/admin/trade-analytics" },
  { title: "Profile", icon: User, path: "/admin/profile" },
];

const subadminMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/subadmin/dashboard" },
  { title: "Users", icon: Users, path: "/subadmin/users" },
  { title: "Courses", icon: BookOpen, path: "/subadmin/courses" },
  { title: "Lessons", icon: FileText, path: "/subadmin/lessons" },
  { title: "Quiz", icon: HelpCircle, path: "/subadmin/quiz" },
  { title: "Trade Analytics", icon: BarChart3, path: "/subadmin/trade-analytics" },
  { title: "Profile", icon: User, path: "/subadmin/profile" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const menu = user?.role === "admin" ? adminMenu : subadminMenu;

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
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
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
                {user?.name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menu.map((item) => {
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

export default AppSidebar;
