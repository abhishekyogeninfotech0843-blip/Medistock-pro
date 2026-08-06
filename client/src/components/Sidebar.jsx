import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaTachometerAlt,
  FaPills,
  FaShoppingCart,
  FaTruck,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaBoxes,
  FaHospitalSymbol,
  FaUserShield,
  FaUserMd,
  FaHeartbeat,
  FaVideo,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : {
        name: "Abhishek Admin",
        role: "Pharmacy Manager",
        email: "admin@gmail.com",
      };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
      badge: "Live",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      name: "Medicines SKU",
      path: "/medicines",
      icon: <FaPills />,
    },
    {
      name: "Stock Purchases",
      path: "/purchase",
      icon: <FaBoxes />,
    },
    {
      name: "Sales & POS",
      path: "/sales",
      icon: <FaShoppingCart />,
      badge: "POS",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: <FaTruck />,
    },
    {
      name: "Patient Records",
      path: "/customers",
      icon: <FaUsers />,
    },
    {
      name: "Analytics & Audit",
      path: "/reports",
      icon: <FaChartBar />,
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800 text-slate-300 flex flex-col justify-between z-30 font-sans shadow-2xl">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/25">
              <FaHospitalSymbol />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-white tracking-wide flex items-center gap-2">
                MediStock{" "}
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-400/30 font-bold">
                  PRO
                </span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Pharmacy System
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <span
                    className={`text-xl transition-colors ${active ? "text-white" : "text-slate-400"}`}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1 truncate">{item.name}</span>

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-4 mt-2 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-4 shadow-inner"
        >
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.3em] text-sky-300">
            <FaHeartbeat className="text-sky-400" />
            Doctor Care Stream
          </div>

          <div className="mt-3 rounded-[2rem] border border-slate-800/60 bg-slate-950/95 p-4 shadow-lg shadow-slate-950/20">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800/70 bg-slate-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.4),_transparent_40%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.35),rgba(15,23,42,0.95))]" />

              <div className="relative p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-3xl bg-slate-800 flex items-center justify-center text-sky-300 shadow-inner shadow-sky-500/20">
                      <FaVideo className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Live Clinical Feed
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Doctor rounds & pharmacy alerts
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold bg-slate-800/80 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-600 px-3 py-4">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-4 left-4 h-2 w-2 rounded-full bg-white/80 blur-sm"
                  />
                  <motion.div
                    animate={{ x: [0, 4, 0, -4, 0] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="h-16 rounded-3xl bg-white/10 border border-white/15 p-3 text-white text-[11px] leading-5">
                        <p className="font-medium">Doctor sync is active</p>
                        <p className="mt-1 text-slate-200/90">
                          Reviewing prescriptions and inventory health.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90">
                        Live
                      </span>
                      <div className="h-11 w-11 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                        <FaUserMd className="text-lg" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-900/95 border border-slate-800/70 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-sky-300">
                  <FaPills className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Doctor notes synced
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Automatically highlight patient medicine recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Profile & Logout Bottom Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="mb-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">
              {user?.name || "Abhishek Admin"}
            </h4>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <FaUserShield className="text-blue-400" />
              {user?.role || "Administrator"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition-all duration-200 group shadow-sm active:scale-98"
        >
          <FaSignOutAlt className="text-base group-hover:rotate-12 transition-transform" />
          <span>Sign Out</span>
        </button>

        <p className="mt-3 text-center text-xs text-slate-500 font-medium">
          MediStock Pro &bull; v2.4 Enterprise
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
