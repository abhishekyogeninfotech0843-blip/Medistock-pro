const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { getDashboard } = require("../controllers/dashboardController");

// ==========================
// Dashboard Route
// ==========================

// Get Dashboard Data
router.get("/", protect, getDashboard);

module.exports = router;
