const Sale = require("../models/Sale");

// ==========================
// Top Selling Medicines
// ==========================
const topSellingMedicines = async (req, res) => {
  try {
    const topMedicines = await Sale.aggregate([
      // Group by medicine
      {
        $group: {
          _id: "$medicine",

          totalQuantity: {
            $sum: "$quantity",
          },

          totalSales: {
            $sum: {
              $multiply: ["$quantity", "$sellingPrice"],
            },
          },
        },
      },

      // Sort Highest Sale
      {
        $sort: {
          totalQuantity: -1,
        },
      },

      // Top 5
      {
        $limit: 5,
      },

      // Medicine Details
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine",
        },
      },

      {
        $unwind: "$medicine",
      },

      {
        $project: {
          _id: 0,

          medicine: "$medicine.name",

          company: "$medicine.company",

          totalQuantity: 1,

          totalSales: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,

      data: topMedicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  topSellingMedicines,
};
