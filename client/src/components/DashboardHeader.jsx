import React, { useState, useEffect } from "react";
import { FaBell, FaCalendarAlt, FaPlus, FaCircle, FaShieldAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const DashboardHeader = ({ onQuickAdd }) => {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : { name: "Abhishek Admin", email: "admin@gmail.com" };

  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return { title: "Executive Dashboard", subtitle: "Real-time inventory, sales velocity & revenue summary" };
      case "/medicines":
        return { title: "Medicine Inventory (SKU)", subtitle: "Manage pharmaceutical products, pricing & stock levels" };
      case "/purchase":
        return { title: "Stock Procurement Orders", subtitle: "Track vendor purchase orders and incoming shipments" };
      case "/sales":
        return { title: "Point of Sale & Billing", subtitle: "Process counter transactions and issue tax receipts" };
      case "/suppliers":
        return { title: "Suppliers & Distributors", subtitle: "Pharmaceutical vendor directory and contact logs" };
      case "/customers":
        return { title: "Patient Profiles", subtitle: "Customer records, prescription notes & purchase histories" };
      case "/reports":
        return { title: "Analytics & Financial Audit", subtitle: "Revenue charts, net profit margins & tax audit downloads" };
      default:
        return { title: "MediStock Pro", subtitle: "Pharmacy Management System" };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans shadow-xs">
      {/* Page Title & Context */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span className="text-blue-600 font-extrabold">MediStock</span>
          <span>/</span>
          <span className="text-slate-600">{pageInfo.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-normal mt-1">
          {pageInfo.title}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Live Pill */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-xs">
          <FaCircle className="text-[8px] text-emerald-500 animate-pulse" />
          <span>Live Inventory Active</span>
        </div>

        {/* Date Pill */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 text-slate-700 text-xs font-bold border border-slate-200/80">
          <FaCalendarAlt className="text-blue-600" />
          <span>{currentDateTime}</span>
        </div>

        {/* Add Medicine Trigger */}
        {location.pathname === "/medicines" && onQuickAdd && (
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
          >
            <FaPlus />
            <span>Add Medicine SKU</span>
          </button>
        )}

        {/* Bell Alert Icon */}
        <div className="relative">
          <button className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition border border-slate-200/80 cursor-pointer">
            <FaBell className="text-lg" />
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="hidden xl:block">
            <span className="block text-sm font-bold text-slate-900 leading-tight">
              {user?.name || "Abhishek Admin"}
            </span>
            <span className="block text-xs text-slate-500 font-medium">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
