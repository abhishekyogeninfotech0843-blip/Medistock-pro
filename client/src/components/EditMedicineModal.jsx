import "./EditMedicineModal.css";
import { useEffect, useState } from "react";
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
          ? medicine.expiryDate.substring(0, 10)
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

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await updateMedicine(medicine._id, formData);

      alert("✅ Medicine Updated Successfully");

      onSuccess();

      onClose();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <h2>✏️ Edit Medicine</h2>

        <div className="edit-grid">
          <input
            className="edit-input"
            name="name"
            placeholder="Medicine Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            name="batchNo"
            placeholder="Batch Number"
            value={formData.batchNo}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            type="number"
            name="purchasePrice"
            placeholder="Purchase Price"
            value={formData.purchasePrice}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            type="number"
            name="sellingPrice"
            placeholder="Selling Price"
            value={formData.sellingPrice}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            type="number"
            name="minimumStock"
            placeholder="Minimum Stock"
            value={formData.minimumStock}
            onChange={handleChange}
          />

          <input
            className="edit-input"
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </div>

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="update-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Medicine"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMedicineModal;
