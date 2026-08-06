const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  updatePayment,
  downloadInvoicePDF,
  searchInvoices,
} = require("../controllers/invoiceController");

// ==========================
// Create Invoice
// ==========================
router.post("/", protect, createInvoice);

// ==========================
// Get All Invoices
// ==========================
router.get("/", protect, getInvoices);

// ==========================
// Search Invoice
// IMPORTANT: Keep before /pdf/:id
// ==========================
router.get("/search", protect, searchInvoices);

// ==========================
// Download Invoice PDF
// ==========================
router.get("/pdf/:id", protect, downloadInvoicePDF);

// ==========================
// Update Invoice Payment
// ==========================
router.patch("/:id/payment", protect, updatePayment);

module.exports = router;
