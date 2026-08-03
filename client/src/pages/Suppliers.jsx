import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { FaTruck, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPlus, FaStar, FaBuilding, FaSearch } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const mockSuppliers = [
  { id: 1, name: "Sun Pharma Distributors", contact: "+91 98230 11223", email: "orders@sunpharma.com", address: "Mumbai Central, MH", rating: 4.9, activeOrders: 3, categories: "Antibiotics, Painkillers" },
  { id: 2, name: "Cipla Healthcare Ltd.", contact: "+91 98450 33445", email: "supply@cipla.co.in", address: "Bandra Kurla Complex, MH", rating: 4.8, activeOrders: 1, categories: "Respiratory, Antivirals" },
  { id: 3, name: "Dr. Reddy's Laboratories", contact: "+91 98990 55667", email: "vendors@drreddys.com", address: "Hyderabad, TS", rating: 4.7, activeOrders: 2, categories: "Diabetes, Cardiac" },
  { id: 4, name: "Torrent Pharmaceuticals", contact: "+91 97110 77889", email: "sales@torrentpharma.com", address: "Ahmedabad, GJ", rating: 4.6, activeOrders: 0, categories: "Gastroenterology" },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "", categories: "" });

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const newSup = {
      id: Date.now(),
      name: form.name,
      contact: form.contact || "+91 98000 00000",
      email: form.email || "info@supplier.com",
      address: form.address || "Main City Hub",
      rating: 5.0,
      activeOrders: 0,
      categories: form.categories || "General Pharmaceuticals",
    };

    setSuppliers([newSup, ...suppliers]);
    toast.success(`Supplier "${form.name}" registered successfully!`);
    setShowModal(false);
    setForm({ name: "", contact: "", email: "", address: "", categories: "" });
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.categories.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Top Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <FaTruck className="text-blue-600" />
            Pharmaceutical Suppliers & Distributors
          </h2>
          <p className="text-base text-slate-500 font-medium mt-1">Manage vendor relations, contact profiles, and fulfillment lead times</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
        >
          <FaPlus />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm font-sans">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search supplier by company name or product category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium"
          />
        </div>
      </div>

      {/* Suppliers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {filtered.map((sup) => (
          <div key={sup.id} className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-xs">
                  <FaBuilding />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{sup.name}</h3>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg mt-1 inline-block">
                    {sup.categories}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <FaStar />
                <span>{sup.rating}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm font-semibold text-slate-700 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <FaPhone className="text-slate-400" />
                <span>{sup.contact}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-slate-400" />
                <span>{sup.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-slate-400" />
                <span>{sup.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500 font-semibold">
                Active Shipments: <strong className="text-slate-900 font-extrabold">{sup.activeOrders} Orders</strong>
              </span>
              <button
                onClick={() => toast.success(`Calling ${sup.name}...`)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Contact Vendor
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Add Pharmaceutical Supplier</h3>
            <form onSubmit={handleAddSupplier} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Company Name</label>
                <input
                  placeholder="e.g. Zydus Cadila"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Phone Contact</label>
                <input
                  placeholder="+91 98000 11111"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="sales@zydus.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Categories Supplied</label>
                <input
                  placeholder="e.g. Antibiotics, Vaccines"
                  value={form.categories}
                  onChange={(e) => setForm({ ...form, categories: e.target.value })}
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Suppliers;
