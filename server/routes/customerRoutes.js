const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  customerPurchaseHistory,
  searchCustomers,
} = require("../controllers/Customercontroller");

// ==========================
// Add Customer
// ==========================
router.post("/", protect, addCustomer);

// ==========================
// Get All Customers
// ==========================
router.get("/", protect, getCustomers);

// ==========================
// Search Customer
// ==========================
router.get("/search", protect, searchCustomers);

// ==========================
// Customer Purchase History
// ==========================
router.get("/:id/history", protect, customerPurchaseHistory);

// ==========================
// Get Customer By ID
// ==========================
router.get("/:id", protect, getCustomerById);

// ==========================
// Update Customer
// ==========================
router.put("/:id", protect, updateCustomer);

// ==========================
// Delete Customer
// ==========================
router.delete("/:id", protect, deleteCustomer);

module.exports = router;
