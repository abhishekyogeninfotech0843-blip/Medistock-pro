const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addSale,
  getSales,
  updatePayment,
} = require("../controllers/saleController");

// ==========================
// Add Sale
// ==========================
router.post("/", protect, addSale);

// ==========================
// Get All Sales
// ==========================
router.get("/", protect, getSales);

// Update payment for a sale
router.patch("/:id/payment", protect, updatePayment);

module.exports = router;
