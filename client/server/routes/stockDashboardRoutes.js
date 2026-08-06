const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { stockDashboard } = require("../controllers/stockDashboardController");

// Stock Dashboard

router.get("/", protect, stockDashboard);

module.exports = router;
