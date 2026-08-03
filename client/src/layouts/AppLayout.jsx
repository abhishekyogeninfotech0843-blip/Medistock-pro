import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

const AppLayout = ({ children, onQuickAdd }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <DashboardHeader onQuickAdd={onQuickAdd} />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
