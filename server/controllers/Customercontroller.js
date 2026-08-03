const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");

// ==========================
// Add Customer
// ==========================
const addCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Customer Added Successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Customers
// ==========================
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Get Customer By ID
// ==========================
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Customer
// ==========================
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer Updated Successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Customer
// ==========================
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Customer Purchase History
// ==========================
const customerPurchaseHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const invoices = await Invoice.find({
      customerName: customer.name,
    }).sort({ createdAt: -1 });

    const totalBills = invoices.length;

    const totalSpent = invoices.reduce((sum, invoice) => {
      return sum + invoice.grandTotal;
    }, 0);

    const lastPurchase = invoices.length > 0 ? invoices[0].invoiceDate : null;

    res.status(200).json({
      success: true,
      customer: customer.name,
      totalBills,
      totalSpent,
      lastPurchase,
      purchases: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Search Customers
// ==========================
// ==========================
// Search Customers
// ==========================
// ==========================
// Search Customers
// ==========================
const searchCustomers = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    console.log("Search Keyword:", keyword);

    const customers = await Customer.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { mobile: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    });

    console.log("Found Customers:", customers);

    res.status(200).json({
      success: true,
      total: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  customerPurchaseHistory,
  searchCustomers,
};
