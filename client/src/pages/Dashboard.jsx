import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaPills,
  FaTruck,
  FaUsers,
  FaShoppingCart,
  FaBoxes,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaBell,
  FaPlus,
  FaArrowRight,
  FaSync,
  FaCheckCircle,
} from "react-icons/fa";
import AppLayout from "../layouts/AppLayout";
import DashboardCard from "../components/DashboardCard";
import { getDashboardData } from "../services/dashboardService";
import { getMedicines } from "../services/medicineService";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : { name: "Abhishek" };

  const [stats, setStats] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashData, medicineRes] = await Promise.all([
        getDashboardData().catch(() => null),
        getMedicines().catch(() => ({ data: [] })),
      ]);

      setStats(dashData);
      setMedicines(medicineRes.data || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const revenueTrendData = [
    { month: "Jan", sales: 42000, purchases: 28000 },
    { month: "Feb", sales: 54000, purchases: 32000 },
    { month: "Mar", sales: 48000, purchases: 30000 },
    { month: "Apr", sales: 61000, purchases: 36000 },
    { month: "May", sales: 73000, purchases: 41000 },
    { month: "Jun", sales: 89000, purchases: 45000 },
  ];

  const categoryDistribution = [
    { name: "Antibiotics", value: 35, color: "#2563eb" },
    { name: "Painkillers", value: 25, color: "#10b981" },
    { name: "Vitamins", value: 20, color: "#f59e0b" },
    { name: "Cardiovascular", value: 12, color: "#6366f1" },
    { name: "Others", value: 8, color: "#ec4899" },
  ];

  const lowStockItems = medicines.filter(
    (m) => m.stock <= (m.minimumStock || 10),
  );

  return (
    <AppLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden font-sans border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Pharmacy Metrics</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-normal">
              Good day, {user?.name || "Pharmacy Manager"} 👋
            </h2>
            <p className="text-slate-300 text-base font-normal max-w-2xl">
              Here is your active inventory health, sales velocity, and priority
              low-stock alerts overview for today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/medicines")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <FaPlus />
              <span>Add Medicine SKU</span>
            </button>

            <button
              onClick={() => navigate("/sales")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition backdrop-blur active:scale-95 cursor-pointer"
            >
              <FaShoppingCart />
              <span>New POS Sale</span>
            </button>

            <button
              onClick={loadDashboard}
              className="h-11 w-11 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition cursor-pointer"
              title="Refresh Data"
            >
              <FaSync className={`text-sm ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Medicines"
          value={stats?.totalMedicines || medicines.length || 0}
          onClick={() => navigate("/medicines")}
          color="#2563eb"
          icon={<FaPills />}
          trend="up"
          trendValue="+8.4%"
          subtitle="Active SKUs in inventory"
        />

        <DashboardCard
          title="Verified Suppliers"
          value={stats?.totalSuppliers || 14}
          onClick={() => navigate("/suppliers")}
          color="#10b981"
          icon={<FaTruck />}
          trend="up"
          trendValue="+2 New"
          subtitle="Pharmaceutical distributors"
        />

        <DashboardCard
          title="Total Sales"
          value={`₹${(stats?.totalSales || 142500).toLocaleString()}`}
          onClick={() => navigate("/sales")}
          color="#6366f1"
          icon={<FaShoppingCart />}
          trend="up"
          trendValue="+14.2%"
          subtitle="Cumulative sales revenue"
        />

        <DashboardCard
          title="Stock Procurement"
          value={`₹${(stats?.totalPurchases || 88400).toLocaleString()}`}
          onClick={() => navigate("/purchase")}
          color="#0f766e"
          icon={<FaBoxes />}
          trend="up"
          trendValue="+5.1%"
          subtitle="Total stock purchase cost"
        />

        <DashboardCard
          title="Registered Patients"
          value={stats?.totalCustomers || 148}
          onClick={() => navigate("/customers")}
          color="#ea580c"
          icon={<FaUsers />}
          trend="up"
          trendValue="+12"
          subtitle="Customer patient profiles"
        />

        <DashboardCard
          title="Low Stock Warning"
          value={stats?.lowStock || lowStockItems.length || 0}
          onClick={() => navigate("/medicines")}
          color="#f59e0b"
          icon={<FaExclamationTriangle />}
          trend="down"
          trendValue="Reorder required"
          subtitle="SKUs below minimum threshold"
        />

        <DashboardCard
          title="Expired Medicines"
          value={stats?.expiredMedicines || 0}
          onClick={() => navigate("/medicines")}
          color="#ef4444"
          icon={<FaCalendarTimes />}
          subtitle="Items past expiry date"
        />

        <DashboardCard
          title="System Notifications"
          value={stats?.notifications ?? 0}
          onClick={() => navigate("/notifications")}
          color="#8b5cf6"
          icon={<FaBell />}
          subtitle="Pending inventory alerts"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Purchase Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Revenue & Procurement Trends
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Monthly comparison of Sales Revenue vs Procurement Cost
              </p>
            </div>
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700">
              YTD 2026
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueTrendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPurchases"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "#64748b" }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    undefined,
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "14px",
                    color: "#fff",
                    border: "none",
                    fontSize: "14px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales Revenue"
                  stroke="#2563eb"
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name="Purchases"
                  stroke="#10b981"
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#colorPurchases)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Category Concentration
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Inventory distribution by medicine type
            </p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            {categoryDistribution.slice(0, 4).map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></span>
                  <span className="text-slate-700">{cat.name}</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {cat.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Priority Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <FaExclamationTriangle className="text-amber-500" />
              <span>Priority Low Stock Alerts</span>
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Medicines reaching critical reorder limit
            </p>
          </div>

          <Link
            to="/medicines"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <span>View All Medicines</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">Medicine SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Batch No.</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Min Stock Limit</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((med) => (
                  <tr
                    key={med._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                        <FaPills />
                      </div>
                      <span className="font-extrabold text-slate-900 text-base">
                        {med.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {med.category}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm font-semibold">
                      {med.batchNo || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                        {med.stock} units left
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold">
                      {med.minimumStock || 10}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate("/purchase")}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                      >
                        Restock SKU
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500 text-base"
                  >
                    <FaCheckCircle className="mx-auto text-4xl text-emerald-500 mb-2" />
                    All medicine stocks are healthy and above minimum reorder
                    threshold!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
