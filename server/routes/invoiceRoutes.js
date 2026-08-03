const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
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

module.exports = router;
