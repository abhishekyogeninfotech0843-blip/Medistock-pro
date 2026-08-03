const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Medicine = require("../models/Medicine");

// ==========================
// Daily Sales Report
// ==========================
const dailySalesReport = async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const sales = await Sale.find({
      saleDate: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate("medicine", "name company");

    const totalSales = sales.reduce((sum, sale) => {
      return sum + sale.quantity * sale.sellingPrice;
    }, 0);

    res.status(200).json({
      success: true,
      totalBills: sales.length,
      totalSales,
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
// Monthly Sales Report
// ==========================
const monthlySalesReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 1);

    const sales = await Sale.find({
      saleDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).populate("medicine", "name company");

    const totalSales = sales.reduce((sum, sale) => {
      return sum + sale.quantity * sale.sellingPrice;
    }, 0);

    res.status(200).json({
      success: true,
      totalBills: sales.length,
      totalSales,
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
// Profit Report
// ==========================
const profitReport = async (req, res) => {
  try {
    const sales = await Sale.find().populate(
      "medicine",
      "name purchasePrice sellingPrice",
    );

    let totalProfit = 0;

    const report = sales.map((sale) => {
      const purchasePrice = sale.medicine.purchasePrice;
      const sellingPrice = sale.sellingPrice;

      const profit = (sellingPrice - purchasePrice) * sale.quantity;

      totalProfit += profit;

      return {
        medicine: sale.medicine.name,
        quantity: sale.quantity,
        purchasePrice,
        sellingPrice,
        profit,
      };
    });

    res.status(200).json({
      success: true,
      totalProfit,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Purchase Report
// ==========================
const purchaseReport = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name company")
      .populate("medicine", "name company")
      .sort({ purchaseDate: -1 });

    const totalPurchaseAmount = purchases.reduce((sum, purchase) => {
      return sum + purchase.quantity * purchase.purchasePrice;
    }, 0);

    res.status(200).json({
      success: true,
      totalPurchases: purchases.length,
      totalPurchaseAmount,
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
// Dashboard Analytics
// ==========================
const dashboardAnalytics = async (req, res) => {
  try {
    // Today's Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current Month
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's Sales
    const todaySalesData = await Sale.find({
      saleDate: { $gte: today },
    });

    const todaySales = todaySalesData.reduce((sum, sale) => {
      return sum + sale.quantity * sale.sellingPrice;
    }, 0);

    // Monthly Sales
    const monthlySalesData = await Sale.find({
      saleDate: { $gte: startMonth },
    });

    const monthlySales = monthlySalesData.reduce((sum, sale) => {
      return sum + sale.quantity * sale.sellingPrice;
    }, 0);

    // Total Profit
    const sales = await Sale.find().populate(
      "medicine",
      "purchasePrice sellingPrice",
    );

    let totalProfit = 0;

    sales.forEach((sale) => {
      totalProfit +=
        (sale.sellingPrice - sale.medicine.purchasePrice) * sale.quantity;
    });

    // Total Purchase
    const purchases = await Purchase.find();

    const totalPurchase = purchases.reduce((sum, purchase) => {
      return sum + purchase.quantity * purchase.purchasePrice;
    }, 0);

    // Low Stock Medicines
    const lowStockMedicines = await Medicine.find({
      $expr: {
        $lte: ["$stock", "$minimumStock"],
      },
    }).select("name stock minimumStock");

    // Expired Medicines
    const expiredMedicines = await Medicine.find({
      expiryDate: { $lt: new Date() },
    }).select("name expiryDate");

    res.status(200).json({
      success: true,
      data: {
        todaySales,
        monthlySales,
        totalProfit,
        totalPurchase,
        lowStockMedicines,
        expiredMedicines,
      },
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
  dailySalesReport,
  monthlySalesReport,
  profitReport,
  purchaseReport,
  dashboardAnalytics,
};
