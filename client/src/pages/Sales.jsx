import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { FaShoppingCart, FaPlus, FaReceipt, FaCheckCircle, FaPrint, FaSearch, FaCreditCard, FaMoneyBillWave, FaQrcode } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const mockSales = [
  { id: "INV-8021", customer: "Rajesh Kumar", items: "Amoxicillin 500mg (2x), Paracetamol (1x)", total: 450, payment: "UPI / GPay", time: "10:42 AM Today" },
  { id: "INV-8022", customer: "Priya Sharma", items: "Vitamin C 1000mg (3x)", total: 360, payment: "Cash", time: "11:15 AM Today" },
  { id: "INV-8023", customer: "Walk-in Patient", items: "Bandage Roll, Betadine Ointment", total: 180, payment: "Card", time: "01:30 PM Today" },
  { id: "INV-8024", customer: "Anil Deshmukh", items: "Metformin 500mg (4x)", total: 640, payment: "UPI / GPay", time: "03:10 PM Today" },
];

const Sales = () => {
  const [sales, setSales] = useState(mockSales);
  const [search, setSearch] = useState("");
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const [form, setForm] = useState({ customer: "Walk-in Patient", items: "", total: "", payment: "UPI / GPay" });

  const handleCreateSale = (e) => {
    e.preventDefault();
    if (!form.total) return;

    const newSale = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: form.customer || "Walk-in Patient",
      items: form.items || "General Pharmacy Counter Items",
      total: parseFloat(form.total),
      payment: form.payment,
      time: "Just Now",
    };

    setSales([newSale, ...sales]);
    toast.success(`Invoice ${newSale.id} generated!`);
    setActiveInvoice(newSale);
    setShowPOSModal(false);
    setForm({ customer: "Walk-in Patient", items: "", total: "", payment: "UPI / GPay" });
  };

  const filtered = sales.filter(
    (s) =>
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Top Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <FaShoppingCart className="text-blue-600" />
            Point of Sale & Counter Billing
          </h2>
          <p className="text-base text-slate-500 font-medium mt-1">Process transactions, generate digital invoices & print receipts</p>
        </div>

        <button
          onClick={() => setShowPOSModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
        >
          <FaPlus />
          <span>New Billing Sale</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</span>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1.5">₹14,250</h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">28 transactions processed</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Average Ticket Size</span>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1.5">₹508.90</h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">+6.2% yield margin</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Primary Payment Mode</span>
          <h3 className="text-3xl font-extrabold text-indigo-600 mt-1.5">UPI / QR (68%)</h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Instant settlement</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm font-sans">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search invoice number or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
              <th className="px-6 py-4">Invoice Reference</th>
              <th className="px-6 py-4">Patient / Customer</th>
              <th className="px-6 py-4">Items Billed</th>
              <th className="px-6 py-4">Payment Method</th>
              <th className="px-6 py-4">Total Bill (₹)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-base">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-mono font-extrabold text-indigo-600">{inv.id}</td>
                <td className="px-6 py-5 font-bold text-slate-900">{inv.customer}</td>
                <td className="px-6 py-5 text-slate-600 text-sm font-semibold">{inv.items}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">
                    {inv.payment}
                  </span>
                </td>
                <td className="px-6 py-5 font-black text-emerald-600 text-lg">₹{inv.total.toFixed(2)}</td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => setActiveInvoice(inv)}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs hover:bg-blue-100 transition flex items-center gap-2 ml-auto cursor-pointer"
                  >
                    <FaReceipt />
                    <span>View Receipt</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New POS Modal */}
      {showPOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900">New POS Transaction</h3>
            <form onSubmit={handleCreateSale} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Patient / Customer Name</label>
                <input
                  placeholder="e.g. Walk-in Patient"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Medicines Billed Summary</label>
                <input
                  placeholder="e.g. Paracetamol 500mg x2, Cough Syrup x1"
                  value={form.items}
                  onChange={(e) => setForm({ ...form, items: e.target.value })}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="450.00"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Payment Method</label>
                <select
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                >
                  <option value="UPI / GPay">UPI / GPay (QR Code)</option>
                  <option value="Cash">Cash Counter</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPOSModal(false)}
                  className="px-5 py-2.5 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm shadow"
                >
                  Complete Sale & Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Receipt Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
              <h3 className="font-extrabold text-2xl text-slate-900">MediStock Pharmacy</h3>
              <p className="text-sm text-slate-500 font-medium">Official Tax Invoice</p>
              <span className="inline-block mt-2 font-mono text-sm font-black text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full">
                {activeInvoice.id}
              </span>
            </div>

            <div className="space-y-3 text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-extrabold text-slate-900">{activeInvoice.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-bold text-slate-800">{activeInvoice.payment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Items:</span>
                <span className="font-semibold text-slate-700 text-right">{activeInvoice.items}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-base">Total Paid:</span>
              <span className="font-black text-emerald-600 text-2xl">₹{activeInvoice.total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setActiveInvoice(null)}
              className="w-full h-12 rounded-2xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <FaPrint />
              <span>Close & Print Receipt</span>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Sales;
