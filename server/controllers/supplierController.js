const Supplier = require("../models/Supplier");

// ==========================
// Add Supplier
// ==========================
const addSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      success: true,
      message: "Supplier Added Successfully",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Suppliers
// ==========================
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Single Supplier
// ==========================
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Supplier
// ==========================
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier Updated Successfully",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Supplier
// ==========================
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Search Suppliers
// ==========================
const searchSuppliers = async (req, res) => {
  try {
    const { keyword } = req.query;

    const suppliers = await Supplier.find({
      $or: [
        {
          name: {
            $regex: keyword || "",
            $options: "i",
          },
        },
        {
          company: {
            $regex: keyword || "",
            $options: "i",
          },
        },
        {
          mobile: {
            $regex: keyword || "",
            $options: "i",
          },
        },
        {
          email: {
            $regex: keyword || "",
            $options: "i",
          },
        },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: suppliers.length,
      data: suppliers,
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
  addSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
};
