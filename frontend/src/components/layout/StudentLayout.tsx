import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import PageCard from "@/components/common/PageCard";
import { cn } from "@/lib/utils";

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AppHeader sidebarCollapsed={true} onToggleSidebar={() => { }} />
      <main className="pt-16 min-h-screen">
        <div className="p-3 md:p-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
          <PageCard>
            <Outlet />
          </PageCard>
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
