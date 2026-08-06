const cron = require("node-cron");

const Medicine = require("../models/Medicine");
const Notification = require("../models/Notification");

// ==========================
// Expiry Notification Scheduler
// Runs Daily 12 AM
// ==========================

const expiryScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();

      const next30Days = new Date();

      next30Days.setDate(today.getDate() + 30);

      // Expiring Soon Medicines

      const medicines = await Medicine.find({
        expiryDate: {
          $lte: next30Days,
        },
      });

      for (const medicine of medicines) {
        const existingNotification = await Notification.findOne({
          type: "EXPIRY",

          message: {
            $regex: medicine.name,
          },
        });

        if (!existingNotification) {
          await Notification.create({
            type: "EXPIRY",

            title: "Medicine Expiry Alert",

            message: `${medicine.name} is expiring soon`,
          });
        }
      }

      console.log("Expiry Notification Checked");
    } catch (error) {
      console.log("Expiry Scheduler Error:", error.message);
    }
  });
};

module.exports = expiryScheduler;
