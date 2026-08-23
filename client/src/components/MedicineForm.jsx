import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaPills,
  FaBuilding,
  FaTag,
  FaBarcode,
  FaCalendarAlt,
  FaDollarSign,
  FaBoxes,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { addMedicine } from "../services/medicineService";

const initialState = {
  name: "",
  company: "",
  category: "",
  batchNo: "",
  expiryDate: "",
  purchasePrice: "",
  sellingPrice: "",
  stock: "",
  minimumStock: "",
  packSize: "10",
};

const MedicineForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateMargin = () => {
    const p = parseFloat(formData.purchasePrice);
    const s = parseFloat(formData.sellingPrice);
    if (p > 0 && s > 0) {
      const margin = ((s - p) / p) * 100;
      return margin.toFixed(1);
    }
    return null;
  };

  const margin = calculateMargin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: (formData.name || "").trim(),
        company: (formData.company || "").trim(),
        category: (formData.category || "").trim(),
        batchNo: (formData.batchNo || "").trim(),
        expiryDate: formData.expiryDate,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stock: Number(formData.stock) || 0,
        minimumStock: Number(formData.minimumStock) || 10,
        packSize: Number(formData.packSize) || 10,
      };
      await addMedicine(payload);
      toast.success(`Medicine "${payload.name}" added successfully!`);
      setFormData(initialState);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Add Medicine error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to add medicine"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <FaPills className="text-lg" />
            </div>
            Add New Medicine SKU
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Fill in batch details, prices, and stock limits
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Medicine Name *
          </label>
          <input
            name="name"
            placeholder="e.g. Amoxicillin 500mg"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <input
            name="category"
            placeholder="e.g. Antibiotics"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Manufacturer / Company *
          </label>
          <input
            name="company"
            placeholder="e.g. Pfizer Inc."
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Batch Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Batch Number *
          </label>
          <input
            name="batchNo"
            placeholder="e.g. BATCH-2026-99"
            value={formData.batchNo}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white font-mono text-xs"
          />
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Purchase Price (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            name="purchasePrice"
            placeholder="0.00"
            value={formData.purchasePrice}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Selling Price (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            name="sellingPrice"
            placeholder="0.00"
            value={formData.sellingPrice}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Initial Stock Units *
          </label>
          <input
            type="number"
            name="stock"
            placeholder="100"
            value={formData.stock}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Minimum Stock Limit */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Reorder Alert Limit *
          </label>
          <input
            type="number"
            name="minimumStock"
            placeholder="10"
            value={formData.minimumStock}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Pack Size */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Pack Size (tablets per strip) *
          </label>
          <input
            type="number"
            name="packSize"
            placeholder="10"
            value={formData.packSize}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Expiry Date */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Expiry Date *
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Margin Indicator Preview */}
      {margin !== null && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <span>Profit Margin Estimate:</span>
          <span className="font-extrabold text-sm">{margin}% Markup</span>
        </div>
      )}

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 font-bold text-xs text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-indigo-500 transition disabled:opacity-60"
        >
          <FaCheck />
          <span>{loading ? "Saving SKU..." : "Save Medicine SKU"}</span>
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;
