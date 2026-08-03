const StockLedger = require("../models/StockLedger");

// ==========================
// Get Stock History
// ==========================
const getStockHistory = async (req, res) => {
  try {
    const history = await StockLedger.find({
      medicine: req.params.id,
    })
      .populate("medicine", "name company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStockHistory,
};
