const Sale = require("../models/Sale");
const Medicine = require("../models/Medicine");
const StockLedger = require("../models/StockLedger");
const Notification = require("../models/Notification");

// Helper: normalize payment value
const normalizePayment = (payment) => {
  let paymentMethod = (payment || "").toString().trim();
  if (!paymentMethod) {
    return "UPI / GPay";
  }
  const p = paymentMethod.toLowerCase();
  if (p.includes("cash")) return "Cash";
  if (p.includes("card") || p.includes("debit") || p.includes("credit"))
    return "Card";
  if (p.includes("upi") || p.includes("gpay") || p.includes("qr"))
    return "UPI / GPay";
  return paymentMethod;
};

// ==========================
// Add Sale
// ==========================
const addSale = async (req, res) => {
  try {
    const {
      customerName,
      medicine,
      quantity,
      invoiceNumber,
      saleDate,
      payment,
    } = req.body;

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

    // Compute total for this sale
    const total = Number(sellingPrice) * Number(quantity);

    // Normalize payment method
    const paymentMethod = normalizePayment(payment);

    // Create Sale
    const sale = await Sale.create({
      customerName,

      medicine,

      quantity,

      sellingPrice,

      total,

      payment: paymentMethod,

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

    // populate before returning
    const populated = await Sale.findById(sale._id).populate(
      "medicine",
      "name company",
    );

    res.status(201).json({
      success: true,
      message: "Sale Added Successfully",
      data: populated,
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

    // Ensure payment is normalized for all returned records
    const normalized = sales.map((s) => {
      const obj = s.toObject ? s.toObject() : s;
      obj.payment = normalizePayment(obj.payment);
      return obj;
    });

    res.status(200).json({
      success: true,
      total: normalized.length,
      data: normalized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================
// Update Sale Payment
// ==========================
const updatePayment = async (req, res) => {
  try {
    const saleId = req.params.id;
    const { payment } = req.body;

    if (!saleId) {
      return res
        .status(400)
        .json({ success: false, message: "Sale id required" });
    }

    // Normalize payment method similar to addSale
    let paymentMethod = (payment || "").toString().trim();
    if (!paymentMethod) {
      paymentMethod = "UPI / GPay";
    } else {
      const p = paymentMethod.toLowerCase();
      if (p.includes("cash")) paymentMethod = "Cash";
      else if (
        p.includes("card") ||
        p.includes("debit") ||
        p.includes("credit")
      )
        paymentMethod = "Card";
      else if (p.includes("upi") || p.includes("gpay") || p.includes("qr"))
        paymentMethod = "UPI / GPay";
      else paymentMethod = paymentMethod;
    }

    const updated = await Sale.findByIdAndUpdate(
      saleId,
      { payment: paymentMethod },
      { new: true },
    ).populate("medicine", "name company");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Export
// ==========================
module.exports = {
  addSale,

  getSales,
  // Update payment for a sale
  updatePayment,
};
