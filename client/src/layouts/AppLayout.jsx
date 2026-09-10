import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

const AppLayout = ({ children, onQuickAdd }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto overflow-x-hidden">
        <DashboardHeader
          onQuickAdd={onQuickAdd}
          onToggleMobile={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

