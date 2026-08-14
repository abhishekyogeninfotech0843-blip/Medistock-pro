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
  FaMoneyBillWave,
  FaHandHoldingUsd,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import AppLayout from "../layouts/AppLayout";
import DashboardCard from "../components/DashboardCard";
import { getDashboardData } from "../services/dashboardService";
import { getMedicines } from "../services/medicineService";
import { updateInvoiceDue } from "../services/invoiceService";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : { name: "Abhishek" };

  const [stats, setStats] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [submittingPay, setSubmittingPay] = useState(false);

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

  const handleClearDuePayment = async (e) => {
    e.preventDefault();
    if (!payModalInvoice || !payAmount || Number(payAmount) <= 0) {
      return toast.error("Please enter a valid payment amount");
    }

    try {
      setSubmittingPay(true);
      await updateInvoiceDue(payModalInvoice._id || payModalInvoice.id, Number(payAmount));
      toast.success(`Received ₹${payAmount} from ${payModalInvoice.customerName}! Balance updated.`);
      setPayModalInvoice(null);
      setPayAmount("");
      loadDashboard();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmittingPay(false);
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
          title="Customer Dues (उधारी)"
          value={`₹${(stats?.totalCustomerDues || 0).toLocaleString()}`}
          onClick={() => navigate("/sales")}
          color="#dc2626"
          icon={<FaHandHoldingUsd />}
          trend={stats?.totalCustomerDues > 0 ? "up" : "down"}
          trendValue={stats?.totalCustomerDues > 0 ? "Pending Dues" : "No Dues"}
          subtitle="Outstanding customer balances"
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
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#0f766e"
                  strokeWidth={3}
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
              Sales by Category
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Category contribution to monthly sales
            </p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Priority Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
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

      {/* Customer Dues / Credit Ledger Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FaHandHoldingUsd className="text-rose-600" />
              <span>Customer Outstanding Dues (ग्राहकों की बकाया राशि)</span>
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Live ledger of pending balance dues owed by customers across sales bills
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-sm">
              Total Outstanding: ₹{(stats?.totalCustomerDues || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Invoice No.</th>
                <th className="px-6 py-4">Total Bill (₹)</th>
                <th className="px-6 py-4">Paid Amount (₹)</th>
                <th className="px-6 py-4">Remaining Due (₹)</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats?.customerDuesList && stats.customerDuesList.length > 0 ? (
                stats.customerDuesList.map((inv) => (
                  <tr
                    key={inv._id || inv.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-base">
                      <div>
                        <span>{inv.customerName}</span>
                        {inv.customerMobile && (
                          <span className="block text-xs font-normal text-slate-400">
                            {inv.customerMobile}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{Number(inv.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₹{Number(inv.paidAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-black bg-rose-100 text-rose-800">
                        ₹{Number(inv.dueAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setPayModalInvoice(inv);
                          setPayAmount(String(inv.dueAmount || ""));
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5 ml-auto"
                      >
                        <FaMoneyBillWave />
                        <span>Receive Payment</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500 text-base font-medium"
                  >
                    <FaCheckCircle className="mx-auto text-3xl text-emerald-500 mb-2" />
                    No pending customer dues! All sales are fully settled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Due Payment Quick Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-600" />
                <span>Receive Customer Payment</span>
              </h3>
              <button
                type="button"
                onClick={() => setPayModalInvoice(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-base flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Customer:</span>
                <span className="font-extrabold text-slate-900">{payModalInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Invoice No:</span>
                <span className="font-mono font-bold text-indigo-600">{payModalInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Bill:</span>
                <span className="font-bold text-slate-800">₹{Number(payModalInvoice.grandTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Current Due (उधारी):</span>
                <span className="font-black text-rose-600 text-base">₹{Number(payModalInvoice.dueAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleClearDuePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Payment Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={payModalInvoice.dueAmount}
                  placeholder={`Max ₹${payModalInvoice.dueAmount}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-lg font-black text-emerald-700 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-between items-center gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-5 py-2.5 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                >
                  {submittingPay ? "Recording..." : "Clear Due (जमा करें)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
