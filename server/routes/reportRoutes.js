const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  dailySalesReport,
  monthlySalesReport,
  profitReport,
  purchaseReport,
  dashboardAnalytics,
} = require("../controllers/reportController");

// ==========================
// Daily Sales Report
// ==========================
router.get("/daily-sales", protect, dailySalesReport);

// ==========================
// Monthly Sales Report
// ==========================
router.get("/monthly-sales", protect, monthlySalesReport);

// ==========================
// Profit Report
// ==========================
router.get("/profit", protect, profitReport);

// ==========================
// Purchase Report
// ==========================
router.get("/purchase", protect, purchaseReport);

// ==========================
// Dashboard Analytics
// ==========================
router.get("/dashboard", protect, dashboardAnalytics);

module.exports = router;
