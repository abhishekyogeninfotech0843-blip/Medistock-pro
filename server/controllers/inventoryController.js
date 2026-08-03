const Medicine = require("../models/Medicine");

// ==========================
// Low Stock Medicines
// ==========================
const lowStockMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      $expr: { $lte: ["$stock", "$minimumStock"] },
    }).sort({ stock: 1 });

    res.status(200).json({
      success: true,
      total: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Expired Medicines
// ==========================
const expiredMedicines = async (req, res) => {
  try {
    const today = new Date();

    const medicines = await Medicine.find({
      expiryDate: { $lt: today },
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      total: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Expiring Soon (30 Days)
// ==========================
const expiringSoonMedicines = async (req, res) => {
  try {
    const today = new Date();

    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const medicines = await Medicine.find({
      expiryDate: {
        $gte: today,
        $lte: next30Days,
      },
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      total: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Inventory Alert Summary
// ==========================
const inventorySummary = async (req, res) => {
  try {
    const today = new Date();

    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const lowStock = await Medicine.countDocuments({
      $expr: {
        $lte: ["$stock", "$minimumStock"],
      },
    });

    const expired = await Medicine.countDocuments({
      expiryDate: { $lt: today },
    });

    const expiringSoon = await Medicine.countDocuments({
      expiryDate: {
        $gte: today,
        $lte: next30Days,
      },
    });

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
  lowStockMedicines,
  expiredMedicines,
  expiringSoonMedicines,
  inventorySummary,
};
