import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MedicineForm from "../components/MedicineForm";
import EditMedicineModal from "../components/EditMedicineModal";

import { getMedicines, deleteMedicine } from "../services/medicineService";

const Medicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit States
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ==========================
  // Load Medicines
  // ==========================
  useEffect(() => {
    fetchMedicines();
  }, []);

  // ==========================
  // Search Medicines
  // ==========================
  useEffect(() => {
    const filtered = medicines.filter((medicine) => {
      return (
        medicine.name?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.company?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.category?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.batchNo?.toLowerCase().includes(search.toLowerCase())
      );
    });

    setFilteredMedicines(filtered);
  }, [search, medicines]);

  // ==========================
  // Fetch Medicines
  // ==========================
  const fetchMedicines = async () => {
    try {
      setLoading(true);

      const response = await getMedicines();

      const medicineList = response.data || [];

      setMedicines(medicineList);
      setFilteredMedicines(medicineList);
    } catch (error) {
      console.log(error);

      alert("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Delete Medicine
  // ==========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?",
    );

    if (!confirmDelete) return;

    try {
      await deleteMedicine(id);

      alert("✅ Medicine Deleted Successfully");

      fetchMedicines();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  // ==========================
  // Edit Medicine
  // ==========================
  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);

    setShowEditModal(true);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f4f7fe",
          minHeight: "100vh",
        }}
      >
        <h1>💊 Medicines</h1>

        <br />

        <MedicineForm onSuccess={fetchMedicines} />

        <br />

        <input
          type="text"
          placeholder="🔍 Search Medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        />

        {loading ? (
          <h2>Loading...</h2>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
          >
            <thead
              style={{
                background: "#2563eb",
                color: "#fff",
              }}
            >
              <tr>
                <th style={{ padding: "12px" }}>Medicine</th>

                <th>Category</th>

                <th>Company</th>

                <th>Batch</th>

                <th>Purchase</th>

                <th>Selling</th>

                <th>Stock</th>

                <th>Expiry</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine._id}>
                    <td style={{ padding: "12px" }}>{medicine.name}</td>

                    <td>{medicine.category}</td>

                    <td>{medicine.company}</td>

                    <td>{medicine.batchNo}</td>

                    <td>₹ {medicine.purchasePrice}</td>

                    <td>₹ {medicine.sellingPrice}</td>

                    <td>
                      <span
                        style={{
                          color:
                            medicine.stock <= medicine.minimumStock
                              ? "red"
                              : "green",

                          fontWeight: "bold",
                        }}
                      >
                        {medicine.stock}
                      </span>
                    </td>

                    <td>
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        onClick={() => handleEdit(medicine)}
                        style={{
                          background: "#f59e0b",
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          marginRight: "8px",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => handleDelete(medicine._id)}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No Medicines Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Edit Modal */}

        {showEditModal && (
          <EditMedicineModal
            medicine={selectedMedicine}
            onClose={() => {
              setShowEditModal(false);

              setSelectedMedicine(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);

              setSelectedMedicine(null);

              fetchMedicines();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Medicine;
