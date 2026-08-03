import React from "react";
import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const DashboardCard = ({ title, value, color, icon, trend, trendValue, subtitle }) => {
  const isPositive = trend === "up";

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group font-sans"
    >
      {/* Top Accent Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color || "#2563eb" }}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          {/* Icon Badge */}
          <div
            className="h-13 w-13 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${color}15`,
              color: color || "#2563eb",
            }}
          >
            {icon}
          </div>

          {/* Trend Badge */}
          {trendValue && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {isPositive ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>

        {/* Value */}
        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-normal mt-1.5">
          {value}
        </h3>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 font-semibold">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default DashboardCard;
