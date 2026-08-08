const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const StockHistory = require("../models/stockhistory");
const Medicine = require("../models/Medicine");

// ==========================
// Add Medicine
// ==========================
const addMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);

    res.status(201).json({
      success: true,
      message: "Medicine Added Successfully",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Medicines
// ==========================
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });

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
// Get Single Medicine
// ==========================
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Medicine
// ==========================
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Medicine Updated Successfully",
      data: updatedMedicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Medicine
// ==========================
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Medicine Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Search Medicines
// ==========================
const searchMedicines = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

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
// Low Stock Medicines
// ==========================
// ==========================
// Low Stock Medicines
// ==========================
const getLowStockMedicines = async (req, res) => {
  try {
    console.log("========== Low Stock API Hit ==========");

    const medicines = await Medicine.find({
      $expr: {
        $lte: ["$stock", "$minimumStock"],
      },
    }).sort({ stock: 1 });

    console.log("Low Stock Medicines Found:", medicines.length);
    console.log(medicines);

    res.status(200).json({
      success: true,
      total: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.log("Low Stock Error:");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Expired Medicines
// ==========================
// ==========================
// Expired Medicines
// ==========================
const getExpiredMedicines = async (req, res) => {
  try {
    const today = new Date();

    const medicines = await Medicine.find({
      expiryDate: {
        $lt: today,
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
// Near Expiry Medicines (30 Days)
// ==========================
const getNearExpiryMedicines = async (req, res) => {
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
// Stock In Medicine
// ==========================
const stockInMedicine = async (req, res) => {
  try {
    const { quantity } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    medicine.stock += Number(quantity);

    await medicine.save();
    await StockHistory.create({
      medicine: medicine._id,
      type: "IN",
      quantity: Number(quantity),
    });

    res.status(200).json({
      success: true,
      message: "Stock Added Successfully",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Stock Out Medicine
// ==========================
const stockOutMedicine = async (req, res) => {
  try {
    const { quantity } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    if (medicine.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    medicine.stock -= Number(quantity);

    await medicine.save();
    await StockHistory.create({
      medicine: medicine._id,
      type: "OUT",
      quantity: Number(quantity),
    });

    res.status(200).json({
      success: true,
      message: "Stock Removed Successfully",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Get Stock History
// ==========================
const getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find({
      medicine: req.params.id,
    })
      .sort({ createdAt: -1 })
      .populate("medicine", "name company");

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
// ==========================
// Import Medicines From Excel
// ==========================
const importMedicinesFromExcel = async (req, res) => {
  try {
    console.log("req.file =", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const workbook = XLSX.readFile(req.file.path);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const medicines = XLSX.utils.sheet_to_json(sheet);

    if (!medicines.length) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Excel is empty",
      });
    }

    const formattedMedicines = medicines.map((m) => ({
      name: String(m.name || "").trim(),
      company: String(m.company || "").trim(),
      category: String(m.category || "").trim(),
      batchNo: String(m.batchNo || "").trim(),
      expiryDate: new Date(m.expiryDate),
      purchasePrice: Number(m.purchasePrice),
      sellingPrice: Number(m.sellingPrice),
      stock: Number(m.stock || 0),
      minimumStock: Number(m.minimumStock || 10),
    }));

    await Medicine.insertMany(formattedMedicines, {
      ordered: false,
    });

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      total: formattedMedicines.length,
      message: "Medicines Imported Successfully",
    });
  } catch (err) {
    console.error(err);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================
// Export
// ==========================
module.exports = {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getLowStockMedicines,
  getExpiredMedicines,
  getNearExpiryMedicines,
  stockInMedicine,
  stockOutMedicine,
  getStockHistory,
  importMedicinesFromExcel,
};