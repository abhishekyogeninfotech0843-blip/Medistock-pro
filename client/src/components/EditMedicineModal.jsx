import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTimes, FaCheck, FaPills } from "react-icons/fa";
import { updateMedicine } from "../services/medicineService";

const EditMedicineModal = ({ onClose, medicine, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    company: "",
    batchNo: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "",
    minimumStock: "",
    expiryDate: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || "",
        category: medicine.category || "",
        company: medicine.company || "",
        batchNo: medicine.batchNo || "",
        purchasePrice: medicine.purchasePrice || "",
        sellingPrice: medicine.sellingPrice || "",
        stock: medicine.stock || "",
        minimumStock: medicine.minimumStock || "",
        expiryDate: medicine.expiryDate
          ? new Date(medicine.expiryDate).toISOString().substring(0, 10)
          : "",
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateMedicine(medicine._id, formData);
      toast.success(`Medicine "${formData.name}" updated successfully!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update medicine");
    } finally {
      setLoading(false);
    }
  };

  if (!medicine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg">
              <FaEdit />
            </div>
            <div>
              <h3 className="text-lg font-bold">Edit Medicine Record</h3>
              <p className="text-xs text-slate-400 font-medium">SKU ID: {medicine._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Medicine Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company / Brand
              </label>
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Number
              </label>
              <input
                name="batchNo"
                value={formData.batchNo}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Stock Units
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Stock Limit
              </label>
              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 font-bold text-xs text-white shadow-md hover:bg-sky-500 transition disabled:opacity-60"
            >
              <FaCheck />
              <span>{loading ? "Updating..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicineModal;
