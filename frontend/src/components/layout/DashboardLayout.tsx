import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import PageCard from "@/components/common/PageCard";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <AppHeader sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
      <main
        className={cn(
          "pt-16 min-h-screen sidebar-transition",
          collapsed ? "ml-[68px]" : "ml-[240px]"
        )}
      >
        <div className="p-6">
          <PageCard>
            <Outlet />
          </PageCard>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
