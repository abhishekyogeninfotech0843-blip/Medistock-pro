const Medicine = require("../models/Medicine");
const StockLedger = require("../models/StockLedger");

// ==========================
// Stock Dashboard Analytics
// ==========================
const stockDashboard = async (req, res) => {
  try {
    // Total Medicines
    const totalMedicines = await Medicine.countDocuments();

    // Total Stock Quantity
    const medicines = await Medicine.find();

    const totalStock = medicines.reduce((sum, item) => {
      return sum + item.stock;
    }, 0);

    // Total Stock Value
    const stockValue = medicines.reduce((sum, item) => {
      return sum + item.stock * item.purchasePrice;
    }, 0);

    // Today Date
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Today Stock IN
    const todayStockIn = await StockLedger.aggregate([
      {
        $match: {
          type: "STOCK_IN",
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$quantity",
          },
        },
      },
    ]);

    // Today Stock OUT
    const todayStockOut = await StockLedger.aggregate([
      {
        $match: {
          type: "STOCK_OUT",
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$quantity",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,

      data: {
        totalMedicines,

        totalStock,

        stockValue,

        todayStockIn: todayStockIn[0]?.total || 0,

        todayStockOut: todayStockOut[0]?.total || 0,
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
  stockDashboard,
};
