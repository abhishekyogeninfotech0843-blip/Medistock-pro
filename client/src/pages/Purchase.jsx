import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { FaBoxes, FaPlus, FaTruck, FaFileInvoice, FaCheckCircle, FaClock, FaSearch } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const mockPurchases = [
  { id: "PO-9041", supplier: "Sun Pharma Dist.", items: "Amoxicillin 500mg, Paracetamol", amount: 24500, date: "2026-08-01", status: "Delivered" },
  { id: "PO-9042", supplier: "Cipla Healthcare", items: "Azithromycin 250mg, Vitamin C", amount: 18900, date: "2026-08-02", status: "In Transit" },
  { id: "PO-9043", supplier: "Reddy's Labs", items: "Metformin 500mg", amount: 31200, date: "2026-08-03", status: "Pending Approval" },
  { id: "PO-9044", supplier: "Torrent Pharma", items: "Pantoprazole 40mg, Atorvastatin", amount: 15400, date: "2026-07-29", status: "Delivered" },
];

const Purchase = () => {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ supplier: "", items: "", amount: "" });

  const handleAddPurchase = (e) => {
    e.preventDefault();
    if (!form.supplier || !form.amount) return;

    const newPO = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: form.supplier,
      items: form.items || "Bulk Medicines Procurement",
      amount: parseFloat(form.amount),
      date: new Date().toISOString().substring(0, 10),
      status: "Delivered",
    };

    setPurchases([newPO, ...purchases]);
    toast.success(`Purchase Order ${newPO.id} created successfully!`);
    setShowModal(false);
    setForm({ supplier: "", items: "", amount: "" });
  };

  const filtered = purchases.filter(
    (p) =>
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Top Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <FaBoxes className="text-blue-600" />
            Stock Procurement & Purchase Orders
          </h2>
          <p className="text-base text-slate-500 font-medium mt-1">Log stock restocks and track vendor fulfillment timelines</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
        >
          <FaPlus />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Procurements</span>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">₹90,000</h3>
          <p className="text-sm text-emerald-600 mt-1 font-bold">+12% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Shipments</span>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1.5">2 Orders</h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Expected in 24 hours</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Verified Vendors</span>
          <h3 className="text-3xl font-extrabold text-indigo-600 mt-1.5">14 Suppliers</h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">99.4% on-time delivery</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm font-sans">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by Purchase Order ID or Supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium"
          />
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
              <th className="px-6 py-4">PO Reference</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Items / SKUs</th>
              <th className="px-6 py-4">Order Date</th>
              <th className="px-6 py-4">Amount (₹)</th>
              <th className="px-6 py-4">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-base">
            {filtered.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-mono font-extrabold text-blue-600">{po.id}</td>
                <td className="px-6 py-5 font-bold text-slate-900">{po.supplier}</td>
                <td className="px-6 py-5 text-slate-600 text-sm font-semibold">{po.items}</td>
                <td className="px-6 py-5 text-slate-500 text-sm">{po.date}</td>
                <td className="px-6 py-5 font-extrabold text-slate-900 text-lg">₹{po.amount.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black ${
                      po.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : po.status === "In Transit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {po.status === "Delivered" ? <FaCheckCircle /> : <FaClock />}
                    {po.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New PO Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900">Create Purchase Order</h3>
            <form onSubmit={handleAddPurchase} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Supplier Name</label>
                <input
                  placeholder="e.g. Sun Pharma"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Items Summary</label>
                <input
                  placeholder="e.g. Paracetamol 500mg - 500 Boxes"
                  value={form.items}
                  onChange={(e) => setForm({ ...form, items: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Total Cost (₹)</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-sm shadow"
                >
                  Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Purchase;
