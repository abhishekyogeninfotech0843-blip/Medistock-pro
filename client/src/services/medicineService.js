import api from "./api";

// ===============================
// Get All Medicines
// ===============================
export const getMedicines = async () => {
  const response = await api.get("/medicines");
  return response.data;
};

// ===============================
// Get Single Medicine
// ===============================
export const getMedicineById = async (id) => {
  const response = await api.get(`/medicines/${id}`);
  return response.data;
};

// ===============================
// Add Medicine
// ===============================
export const addMedicine = async (medicineData) => {
  const response = await api.post("/medicines", medicineData);
  return response.data;
};

// ===============================
// Update Medicine
// ===============================
export const updateMedicine = async (id, medicineData) => {
  const response = await api.put(`/medicines/${id}`, medicineData);
  return response.data;
};

// ===============================
// Delete Medicine
// ===============================
export const deleteMedicine = async (id) => {
  const response = await api.delete(`/medicines/${id}`);
  return response.data;
};
// ===============================
// Import Medicines From Excel
// ===============================
export const importMedicines = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/medicines/import-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
