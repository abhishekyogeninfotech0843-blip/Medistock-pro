const Sale = require("../models/Sale");
const Medicine = require("../models/Medicine");
const StockLedger = require("../models/StockLedger");
const Notification = require("../models/Notification");

// ==========================
// Add Sale
// ==========================
const addSale = async (req, res) => {
  try {
    const { customerName, medicine, quantity, invoiceNumber, saleDate } =
      req.body;

    // Find Medicine
    const medicineData = await Medicine.findById(medicine);

    if (!medicineData) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // Check Stock
    if (medicineData.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Selling Price Automatically
    const sellingPrice = medicineData.sellingPrice;

    // Create Sale
    const sale = await Sale.create({
      customerName,

      medicine,

      quantity,

      sellingPrice,

      invoiceNumber,

      saleDate: saleDate || new Date(),
    });

    // Reduce Stock
    medicineData.stock -= Number(quantity);

    await medicineData.save();

    // ==========================
    // Stock Ledger Entry
    // ==========================
    await StockLedger.create({
      medicine,

      type: "STOCK_OUT",

      quantity,

      reference: invoiceNumber || "SALE",

      note: "Stock removed from sale",
    });

    // ==========================
    // Sale Notification
    // ==========================
    await Notification.create({
      type: "SALE",

      title: "New Sale Created",

      message: `${medicineData.name} sale completed (${quantity} units)`,
    });

    // ==========================
    // Low Stock Alert
    // ==========================
    if (medicineData.stock <= 10) {
      await Notification.create({
        type: "LOW_STOCK",

        title: "Low Stock Alert",

        message: `${medicineData.name} stock is low. Remaining stock: ${medicineData.stock}`,
      });
    }

    res.status(201).json({
      success: true,

      message: "Sale Added Successfully",

      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================
// Get All Sales
// ==========================
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()

      .populate("medicine", "name company")

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      total: sales.length,

      data: sales,
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
  addSale,

  getSales,
};
