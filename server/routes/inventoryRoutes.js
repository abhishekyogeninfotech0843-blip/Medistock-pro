const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  lowStockMedicines,
  expiredMedicines,
  expiringSoonMedicines,
  inventorySummary,
} = require("../controllers/inventoryController");

// ==========================
// Low Stock Medicines
// ==========================
router.get("/low-stock", protect, lowStockMedicines);

// ==========================
// Expired Medicines
// ==========================
router.get("/expired", protect, expiredMedicines);

// ==========================
// Expiring Soon Medicines
// ==========================
router.get("/expiring-soon", protect, expiringSoonMedicines);

// ==========================
// Inventory Summary
// ==========================
router.get("/summary", protect, inventorySummary);

module.exports = router;
