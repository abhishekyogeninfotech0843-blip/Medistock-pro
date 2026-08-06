const Purchase = require("../models/Purchase");
const Medicine = require("../models/Medicine");
const StockLedger = require("../models/StockLedger");
const Notification = require("../models/Notification");

// ==========================
// Add Purchase
// ==========================
const addPurchase = async (req, res) => {
  try {
    const {
      supplier,
      medicine,
      quantity,
      purchasePrice,
      invoiceNumber,
      purchaseDate,
    } = req.body;

    // Find Medicine
    const medicineData = await Medicine.findById(medicine);

    if (!medicineData) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // Save Purchase
    const purchase = await Purchase.create({
      supplier,
      medicine,
      quantity,
      purchasePrice,
      invoiceNumber,
      purchaseDate,
    });

    // Increase Stock
    medicineData.stock += Number(quantity);

    await medicineData.save();

    // ==========================
    // Stock Ledger Entry
    // ==========================
    await StockLedger.create({
      medicine,

      type: "STOCK_IN",

      quantity,

      reference: invoiceNumber || "PURCHASE",

      note: "Stock added from purchase",
    });

    // ==========================
    // Purchase Notification
    // ==========================
    await Notification.create({
      type: "PURCHASE",

      title: "New Purchase Added",

      message: `${medicineData.name} stock added successfully (${quantity} units)`,
    });

    res.status(201).json({
      success: true,

      message: "Purchase Added Successfully",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================
// Get All Purchases
// ==========================
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()

      .populate("supplier", "name company")

      .populate("medicine", "name company")

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      total: purchases.length,

      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================
// Export
// ==========================
module.exports = {
  addPurchase,

  getPurchases,
};
