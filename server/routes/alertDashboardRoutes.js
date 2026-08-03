const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { inventoryAlerts } = require("../controllers/alertDashboardController");

// Inventory Alerts

router.get("/", protect, inventoryAlerts);

module.exports = router;
