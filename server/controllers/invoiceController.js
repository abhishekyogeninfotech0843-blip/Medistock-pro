const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const Medicine = require("../models/Medicine");
const Counter = require("../models/Counter");

// ==========================
// Create Invoice
// ==========================
const createInvoice = async (req, res) => {
  try {
    const { customerName, items, discount, gst } = req.body;

    // ==========================
    // Generate Invoice Number
    // ==========================
    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true,
      },
    );

    const invoiceNumber = "INV-" + String(counter.sequence).padStart(6, "0");

    let subTotal = 0;

    // ==========================
    // Check Stock & Calculate Total
    // ==========================
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found",
        });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${medicine.name} has insufficient stock`,
        });
      }

      item.sellingPrice = medicine.sellingPrice;
      item.total = item.quantity * medicine.sellingPrice;

      subTotal += item.total;
    }

    const grandTotal = subTotal - Number(discount || 0) + Number(gst || 0);

    // ==========================
    // Reduce Stock
    // ==========================
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);

      medicine.stock -= Number(item.quantity);

      await medicine.save();
    }

    // ==========================
    // Save Invoice
    // ==========================
    const invoice = await Invoice.create({
      customerName,
      invoiceNumber,
      items,
      subTotal,
      discount,
      gst,
      grandTotal,
    });

    res.status(201).json({
      success: true,
      message: "Invoice Created Successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Invoices
// ==========================
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("items.medicine", "name company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Download Invoice PDF
// ==========================
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("items.medicine", "name company");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // ==========================
    // Header
    // ==========================
    doc
      .fontSize(22)
      .text("MEDISTOCK PRO", {
        align: "center",
      });

    doc
      .fontSize(12)
      .text("Pharmacy Management System", {
        align: "center",
      });

    doc.moveDown();

    doc.text(`Invoice No : ${invoice.invoiceNumber}`);
    doc.text(`Customer   : ${invoice.customerName}`);
    doc.text(
      `Date       : ${invoice.invoiceDate.toDateString()}`
    );

    doc.moveDown();

    // Table Header
    doc.text("--------------------------------------------");

    doc.text("Medicine        Qty      Price      Total");

    doc.text("--------------------------------------------");

    // Items
    invoice.items.forEach((item) => {
      doc.text(
        `${item.medicine.name}      ${item.quantity}      ₹${item.sellingPrice}      ₹${item.total}`
      );
    });

    doc.moveDown();

    doc.text("--------------------------------------------");

    doc.text(`Subtotal : ₹${invoice.subTotal}`);
    doc.text(`Discount : ₹${invoice.discount}`);
    doc.text(`GST      : ₹${invoice.gst}`);

    doc.fontSize(14).text(
      `Grand Total : ₹${invoice.grandTotal}`
    );

    doc.moveDown();

    doc.text("Thank You!", {
      align: "center",
    });

    doc.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Search Invoices
// ==========================
const searchInvoices = async (req, res) => {
  try {
    const { keyword, startDate, endDate } = req.query;

    let filter = {};

    // Keyword Search
    if (keyword) {
      filter.$or = [
        {
          invoiceNumber: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }


    // Date Filter
    if (startDate && endDate) {
      filter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }


    const invoices = await Invoice.find(filter)
      .populate("items.medicine", "name company")
      .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      total: invoices.length,
      data: invoices,
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
  createInvoice,
  getInvoices,
  downloadInvoicePDF,
  searchInvoices,
};
