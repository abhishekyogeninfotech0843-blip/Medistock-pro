const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { addSale, getSales } = require("../controllers/saleController");

// ==========================
// Add Sale
// ==========================
router.post("/", protect, addSale);

// ==========================
// Get All Sales
// ==========================
router.get("/", protect, getSales);

module.exports = router;
