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
