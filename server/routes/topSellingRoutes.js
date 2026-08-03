const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { topSellingMedicines } = require("../controllers/topSellingController");

// Top Selling Medicines

router.get("/", protect, topSellingMedicines);

module.exports = router;
