const Notification = require("../models/Notification");

// ==========================
// Get Notifications
// ==========================
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      total: notifications.length,

      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================
// Mark As Read
// ==========================
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,

      {
        read: true,
      },

      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,

        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Notification Read",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
};
