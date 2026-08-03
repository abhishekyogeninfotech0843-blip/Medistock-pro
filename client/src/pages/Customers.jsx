import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { FaUsers, FaPhone, FaSearch, FaPlus, FaCapsules } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const mockCustomers = [
  { id: "CUST-101", name: "Rajesh Kumar", phone: "+91 98111 22334", visits: 12, totalSpent: 4850, lastVisit: "Today", prescription: "Regular BP & Diabetes" },
  { id: "CUST-102", name: "Priya Sharma", phone: "+91 98222 33445", visits: 6, totalSpent: 2100, lastVisit: "2 days ago", prescription: "Multivitamins" },
  { id: "CUST-103", name: "Anil Deshmukh", phone: "+91 98333 44556", visits: 18, totalSpent: 9400, lastVisit: "Yesterday", prescription: "Insulin & Test Strips" },
  { id: "CUST-104", name: "Sunita Patil", phone: "+91 98444 55667", visits: 4, totalSpent: 1450, lastVisit: "Last Week", prescription: "Antibiotics Course" },
];

const Customers = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", prescription: "" });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const newCust = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      phone: form.phone || "+91 98000 00000",
      visits: 1,
      totalSpent: 0,
      lastVisit: "Today",
      prescription: form.prescription || "General OTC",
    };

    setCustomers([newCust, ...customers]);
    toast.success(`Patient record "${form.name}" registered!`);
    setShowModal(false);
    setForm({ name: "", phone: "", prescription: "" });
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Top Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <FaUsers className="text-blue-600" />
            Patient & Customer Profiles
          </h2>
          <p className="text-base text-slate-500 font-medium mt-1">Record patient contact info, purchase history summaries, and active prescriptions</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
        >
          <FaPlus />
          <span>Register Patient Record</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm font-sans">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search patient name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
              <th className="px-6 py-4">Patient Profile</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Pharmacy Visits</th>
              <th className="px-6 py-4">Prescription Focus</th>
              <th className="px-6 py-4">Total Purchases (₹)</th>
              <th className="px-6 py-4 text-right">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-base">
            {filtered.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-900">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-extrabold text-slate-900 text-base">{cust.name}</span>
                      <span className="block text-xs text-slate-400 font-mono mt-0.5">{cust.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-700 text-sm font-semibold">{cust.phone}</td>
                <td className="px-6 py-5 font-bold text-slate-800">{cust.visits} Visits</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                    <FaCapsules className="text-blue-500" />
                    {cust.prescription}
                  </span>
                </td>
                <td className="px-6 py-5 font-black text-emerald-600 text-lg">₹{cust.totalSpent.toLocaleString()}</td>
                <td className="px-6 py-5 text-right text-sm text-slate-500 font-medium">{cust.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Register Patient Profile</h3>
            <form onSubmit={handleAddCustomer} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Patient Full Name</label>
                <input
                  placeholder="e.g. Ramesh Deshmukh"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Phone Number</label>
                <input
                  placeholder="+91 98000 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Ongoing Prescription / Notes</label>
                <input
                  placeholder="e.g. Blood Pressure Medication"
                  value={form.prescription}
                  onChange={(e) => setForm({ ...form, prescription: e.target.value })}
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Customers;
