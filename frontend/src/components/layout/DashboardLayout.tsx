import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <AppHeader sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
      <main
        className={cn(
          "main-content",
          collapsed ? "sidebar-collapsed-ml" : "sidebar-expanded-ml"
        )}
      >
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
