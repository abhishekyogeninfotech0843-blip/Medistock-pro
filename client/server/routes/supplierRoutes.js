const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
} = require("../controllers/supplierController");

// ==========================
// Add Supplier
// ==========================
router.post("/", protect, addSupplier);

// ==========================
// Get All Suppliers
// ==========================
router.get("/", protect, getSuppliers);

// ==========================
// Search Supplier
// IMPORTANT: Keep before /:id
// ==========================
router.get("/search", protect, searchSuppliers);

// ==========================
// Get Single Supplier
// ==========================
router.get("/:id", protect, getSupplierById);

// ==========================
// Update Supplier
// ==========================
router.put("/:id", protect, updateSupplier);

// ==========================
// Delete Supplier
// ==========================
router.delete("/:id", protect, deleteSupplier);

module.exports = router;
