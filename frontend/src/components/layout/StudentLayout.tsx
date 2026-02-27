import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import PageCard from "@/components/common/PageCard";
import ModeToggleFab from "@/components/common/ModeToggleFab";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AppHeader sidebarCollapsed={true} onToggleSidebar={() => { }} />
      <main className="pt-16 min-h-screen pb-20 md:pb-6">
        <div className="p-3 md:p-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
          <PageCard>
            <Outlet />
          </PageCard>
        </div>
        <ModeToggleFab />
        <MobileBottomNav />
      </main>
    </div>
  );
};

export default StudentLayout;
