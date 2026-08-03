import { useState } from "react";
import { addMedicine } from "../services/medicineService";
import "./MedicineForm.css";

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
};

const MedicineForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addMedicine(formData);
      alert("✅ Medicine Added Successfully");
      setFormData(initialState);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="medicine-form" onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Medicine Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        required
      />
      <input
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
        required
      />
      <input
        name="batchNo"
        placeholder="Batch Number"
        value={formData.batchNo}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="purchasePrice"
        placeholder="Purchase Price"
        value={formData.purchasePrice}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="sellingPrice"
        placeholder="Selling Price"
        value={formData.sellingPrice}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="stock"
        placeholder="Stock"
        value={formData.stock}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="minimumStock"
        placeholder="Minimum Stock"
        value={formData.minimumStock}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="expiryDate"
        value={formData.expiryDate}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Medicine"}
      </button>
    </form>
  );
};

export default MedicineForm;
