const Medicine = require("../models/Medicine");

// ==========================
// Inventory Alert Dashboard
// ==========================
const inventoryAlerts = async (req, res) => {
  try {
    // Low Stock (<= 10)
    const lowStock = await Medicine.find({
      stock: {
        $lte: 10,
      },
    }).select("name company stock");

    // Today Date
    const today = new Date();

    // Expired Medicines
    const expired = await Medicine.find({
      expiryDate: {
        $lt: today,
      },
    }).select("name company expiryDate");

    // Expiring Soon (30 Days)
    const next30Days = new Date();

    next30Days.setDate(today.getDate() + 30);

    const expiringSoon = await Medicine.find({
      expiryDate: {
        $gte: today,
        $lte: next30Days,
      },
    }).select("name company expiryDate");

    res.status(200).json({
      success: true,

      data: {
        lowStock,

        expired,

        expiringSoon,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  inventoryAlerts,
};
