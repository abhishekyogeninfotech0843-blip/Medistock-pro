import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { FaChartBar, FaFileDownload, FaPrint, FaDollarSign, FaFileInvoice, FaChartLine, FaBoxes } from "react-icons/fa";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import toast, { Toaster } from "react-hot-toast";

const monthlyPerformance = [
  { month: "Jan", sales: 42000, profit: 14000, expenses: 8000 },
  { month: "Feb", sales: 54000, profit: 22000, expenses: 10000 },
  { month: "Mar", sales: 48000, profit: 18000, expenses: 9000 },
  { month: "Apr", sales: 61000, profit: 25000, expenses: 11000 },
  { month: "May", sales: 73000, profit: 32000, expenses: 12000 },
  { month: "Jun", sales: 89000, profit: 44000, expenses: 14000 },
];

const Reports = () => {
  const handleExport = (type) => {
    toast.success(`Exporting ${type} report...`);
  };

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Top Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <FaChartBar className="text-blue-600" />
            Financial Audit & Inventory Analytics
          </h2>
          <p className="text-base text-slate-500 font-medium mt-1">Download gross revenue statements, net profit margins & stock audits</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("Financial Summary")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <FaFileDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow hover:bg-blue-700 transition active:scale-95 cursor-pointer"
          >
            <FaPrint />
            <span>Print Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue (6 Months)</span>
          <h3 className="text-4xl font-black text-slate-900 mt-2">₹367,000</h3>
          <span className="inline-block mt-3 text-xs font-extrabold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700">
            +18.4% YoY Growth
          </span>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Net Profit Margin</span>
          <h3 className="text-4xl font-black text-emerald-600 mt-2">₹155,000</h3>
          <span className="inline-block mt-3 text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-50 text-blue-700">
            42.2% Average Margin
          </span>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Stock Asset Valuation</span>
          <h3 className="text-4xl font-black text-indigo-600 mt-2">₹248,900</h3>
          <span className="inline-block mt-3 text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700">
            Current Stock Value
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm font-sans">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Monthly Revenue vs Net Profit</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Visualizing monthly sales velocity, profit yield, and operational expenses</p>
          </div>
          <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700">
            Jan - Jun 2026
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#64748b" }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`, undefined]} contentStyle={{ backgroundColor: "#0f172a", borderRadius: "14px", color: "#fff", fontSize: "14px" }} />
              <Legend />
              <Bar dataKey="sales" name="Sales Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Available Downloads */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 font-sans">
        <h3 className="text-xl font-extrabold text-slate-900">Available Audit Downloads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: "Monthly Tax & GST Summary", desc: "Complete breakdown of tax obligations for Q2 2026", type: "Tax PDF" },
            { title: "Stock Expiry Audit Log", desc: "Detailed list of medicines nearing 60-day expiry threshold", type: "Expiry Log" },
            { title: "Supplier Fulfillment Ledger", desc: "Vendor payment history and lead times report", type: "Vendor Ledger" },
          ].map((rpt, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{rpt.title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{rpt.desc}</p>
              </div>
              <button
                onClick={() => handleExport(rpt.type)}
                className="w-full py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-extrabold text-xs hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaFileDownload className="text-blue-600" />
                <span>Download Report</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
