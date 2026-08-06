const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getLowStockMedicines,
  getExpiredMedicines,
  getNearExpiryMedicines,
  stockInMedicine,
  stockOutMedicine,
  getStockHistory,
  importMedicinesFromExcel,
} = require("../controllers/medicineController");

// ==========================
// Search Medicines
// ==========================
router.get("/search", protect, searchMedicines);

// ==========================
// Low Stock Medicines
// ==========================
router.get("/low-stock", protect, getLowStockMedicines);

// ==========================
// Expired Medicines
// ==========================
router.get("/expired", protect, getExpiredMedicines);

// ==========================
// Near Expiry Medicines (30 Days)
// ==========================
router.get("/near-expiry", protect, getNearExpiryMedicines);

// ==========================
// Stock In
// ==========================
router.post("/stock-in/:id", protect, stockInMedicine);

// ==========================
// Stock Out
// ==========================
router.post("/stock-out/:id", protect, stockOutMedicine);

// ==========================
// Stock History
// ==========================
router.get("/stock-history/:id", protect, getStockHistory);

// ==========================
// Add Medicine
// ==========================
router.post(
  "/import-excel",
  protect,
  upload.single("file"),
  importMedicinesFromExcel,
);
router.post("/", protect, addMedicine);

// ==========================
// Get All Medicines
// ==========================
router.get("/", protect, getMedicines);

// ==========================
// Get Single Medicine
// ==========================
router.get("/:id", protect, getMedicineById);

// ==========================
// Update Medicine
// ==========================
router.put("/:id", protect, updateMedicine);

// ==========================
// Delete Medicine
// ==========================
router.delete("/:id", protect, deleteMedicine);

module.exports = router;
