const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addPurchase,
  getPurchases,
} = require("../controllers/purchaseController");

// ==========================
// Add Purchase
// ==========================
router.post("/", protect, addPurchase);

// ==========================
// Get All Purchases
// ==========================
router.get("/", protect, getPurchases);

module.exports = router;
