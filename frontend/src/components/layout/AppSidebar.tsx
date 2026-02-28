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
  Settings,
  CreditCard,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";

const adminMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "SubAdmins", icon: UserCog, path: "/admin/subadmins" },
  { title: "Courses", icon: BookOpen, path: "/admin/courses" },
  { title: "Lessons", icon: FileText, path: "/admin/lessons" },
  { title: "Quizzes", icon: HelpCircle, path: "/admin/quizzes" },
  { title: "Payments", icon: CreditCard, path: "/admin/payments" },
  { title: "Trade Analytics", icon: BarChart3, path: "/admin/trade-analytics" },
  { title: "Refer & Earn", icon: Share2, path: "/admin/refer" },
  // { title: "Settings", icon: Settings, path: "/admin/settings" },
  // { title: "Profile", icon: User, path: "/admin/profile" },
];

const subadminMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/subadmin/dashboard" },
  { title: "Users", icon: Users, path: "/subadmin/users" },
  { title: "Courses", icon: BookOpen, path: "/subadmin/courses" },
  { title: "Lessons", icon: FileText, path: "/subadmin/lessons" },
  { title: "Quizzes", icon: HelpCircle, path: "/subadmin/quizzes" },
  { title: "Payments", icon: CreditCard, path: "/subadmin/payments" },
  { title: "Trade Analytics", icon: BarChart3, path: "/subadmin/trade-analytics" },
  { title: "Refer & Earn", icon: Share2, path: "/subadmin/refer" },
  // { title: "Profile", icon: User, path: "/subadmin/profile" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const { user } = useAuth();
  const { userProfile } = useProfileStore();
  const location = useLocation();
  const menu = user?.role === "admin" ? adminMenu : subadminMenu;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col sidebar-transition  shadow-xl md:shadow-none",
        collapsed ? "-translate-x-full md:translate-x-0 md:w-[68px]" : "translate-x-0 w-[240px] md:w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-sidebar-border overflow-hidden">
        <Link to="/" className="flex items-center w-full h-full">
          {!collapsed ? (
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          ) : (
            <img src="/favicon.png" alt="Favicon" className="h-8 w-8 mx-auto" />
          )}
        </Link>
      </div>

      {/* User Info */}
      {/* User Info */}
      {/* {!collapsed && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <Link to={`/${user?.role}/profile`} className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center overflow-hidden">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-sidebar-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-sidebar-primary-foreground truncate">
                {userProfile?.name || user?.name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground capitalize">{userProfile?.role || user?.role}</p>
            </div>
          </Link>
        </div>
      )} */}

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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-all duration-150 font-medium",
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

export default AppSidebar;
