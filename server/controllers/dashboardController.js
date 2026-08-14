const Medicine = require("../models/Medicine");
const Supplier = require("../models/Supplier");
const Customer = require("../models/Customer");
const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");
const Notification = require("../models/Notification");
const Invoice = require("../models/Invoice");

const getDashboard = async (req, res) => {
  try {
    // Counts
    const totalMedicines = await Medicine.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Purchases Total
    const purchaseData = await Purchase.find();

    const totalPurchases = purchaseData.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0,
    );

    // Sales Total
    const saleData = await Sale.find();

    const totalSales = saleData.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0,
    );

    // Low Stock
    const lowStock = await Medicine.countDocuments({
      quantity: { $lte: 10 },
    });

    // Expired Medicines
    const today = new Date();

    const expiredMedicines = await Medicine.countDocuments({
      expiryDate: { $lt: today },
    });

    // Notifications
    const notifications = await Notification.countDocuments({
      read: false,
    });

    // Customer Dues / Credit Tracking
    const dueInvoices = await Invoice.find({ dueAmount: { $gt: 0 } }).sort({
      createdAt: -1,
    });

    const totalCustomerDues = dueInvoices.reduce(
      (sum, inv) => sum + (inv.dueAmount || 0),
      0,
    );

    res.json({
      totalMedicines,
      totalSuppliers,
      totalCustomers,
      totalPurchases,
      totalSales,
      lowStock,
      expiredMedicines,
      notifications,
      totalCustomerDues,
      customerDuesList: dueInvoices,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};
