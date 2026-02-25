import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import PageCard from "@/components/common/PageCard";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  return (
    <div className="layout-container relative">
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <AppHeader sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
      <main
        className={cn(
          "pt-16 min-h-screen sidebar-transition",
          collapsed ? "md:ml-[68px]" : "md:ml-[240px]"
        )}
      >
        <div className="p-3 md:p-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
          <PageCard>
            <Outlet />
          </PageCard>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
