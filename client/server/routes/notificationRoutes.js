const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");

// Get All Notifications

router.get("/", protect, getNotifications);

// Read Notification

router.put("/:id/read", protect, markNotificationRead);

module.exports = router;
