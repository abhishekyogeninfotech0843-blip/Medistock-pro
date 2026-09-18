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
    const invoice = await Invoice.findById(req.params.id).populate(
      "items.medicine",
      "name company category",
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`,
    );

    doc.pipe(res);

    // Color Palette Constants
    const PRIMARY_COLOR = "#0f766e"; // Emerald / Teal
    const DARK_COLOR = "#0f172a";    // Slate 900
    const TEXT_MUTED = "#64748b";    // Slate 500
    const BORDER_COLOR = "#e2e8f0";  // Slate 200
    const BG_LIGHT = "#f8fafc";      // Slate 50

    // Top Accent Bar
    doc.rect(40, 35, 515, 5).fill(PRIMARY_COLOR);

    // Brand & Pharmacy Header
    doc.font("Helvetica-Bold").fontSize(18).fillColor(DARK_COLOR).text("MEDISTOCK PRO", 40, 48);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(PRIMARY_COLOR).text("PHARMACY & HEALTHCARE RETAIL MANAGEMENT", 40, 68);

    doc.font("Helvetica").fontSize(8).fillColor(TEXT_MUTED);
    const invoiceDateStr = new Date(invoice.invoiceDate || invoice.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const pharmacyInfo = 
      "100% Genuine Medicines • 24x7 Patient Care Support\n" +
      "Lic No: DL-20B/21B-4892  |  GSTIN: 07AABCM1234F1Z9\n" +
      "Email: contact@medistockpro.com  |  Phone: +91 98765 43210";
    doc.text(pharmacyInfo, 40, 80, { lineGap: 2 });

    // Right Header - Tax Invoice Badge Box
    doc.roundedRect(385, 48, 170, 70, 6).fillAndStroke(BG_LIGHT, BORDER_COLOR);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(DARK_COLOR).text("RETAIL TAX INVOICE", 385, 56, { width: 170, align: "center" });
    doc.font("Helvetica-Bold").fontSize(10).fillColor(PRIMARY_COLOR).text(invoice.invoiceNumber, 385, 71, { width: 170, align: "center" });
    doc.font("Helvetica").fontSize(7.5).fillColor(TEXT_MUTED).text(invoiceDateStr, 385, 86, { width: 170, align: "center" });
    
    const paidAmt = Number(
      invoice.paidAmount !== undefined && invoice.paidAmount !== null
        ? invoice.paidAmount
        : invoice.dueAmount !== undefined
        ? Math.max(0, invoice.grandTotal - invoice.dueAmount)
        : invoice.grandTotal
    );
    const dueAmt = Number(invoice.dueAmount || Math.max(0, invoice.grandTotal - paidAmt));

    if (dueAmt > 0) {
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#b91c1c").text(`DUE: Rs. ${dueAmt.toFixed(2)}`, 385, 100, { width: 170, align: "center" });
    } else {
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#15803d").text("STATUS: PAID IN FULL", 385, 100, { width: 170, align: "center" });
    }

    // Divider Line
    doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(40, 126).lineTo(555, 126).stroke();

    // Patient & Payment Info Cards
    const cardY = 134;
    const cardHeight = 62;

    // Left Box: Patient Details
    doc.roundedRect(40, cardY, 250, cardHeight, 6).fillAndStroke(BG_LIGHT, BORDER_COLOR);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(TEXT_MUTED).text("BILLED TO / PATIENT DETAILS", 50, cardY + 8);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(DARK_COLOR).text(invoice.customerName || "Walk-in Patient", 50, cardY + 20);
    doc.font("Helvetica").fontSize(8).fillColor("#334155").text(`Mobile: ${invoice.customerMobile || "Not Specified"}`, 50, cardY + 34);
    doc.font("Helvetica").fontSize(8).fillColor("#334155").text(`Payment Mode: ${invoice.payment || "UPI / GPay"}`, 50, cardY + 46);

    // Right Box: Payment Summary
    doc.roundedRect(305, cardY, 250, cardHeight, 6).fillAndStroke(BG_LIGHT, BORDER_COLOR);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(TEXT_MUTED).text("INVOICE SUMMARY", 315, cardY + 8);
    doc.font("Helvetica").fontSize(8).fillColor("#334155").text(`Grand Total: Rs. ${Number(invoice.grandTotal || 0).toFixed(2)}`, 315, cardY + 20);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#15803d").text(`Paid Amount: Rs. ${paidAmt.toFixed(2)}`, 315, cardY + 34);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(dueAmt > 0 ? "#b91c1c" : "#15803d").text(
      `Balance Due: Rs. ${dueAmt.toFixed(2)} (${dueAmt > 0 ? "Pending" : "Cleared"})`,
      315,
      cardY + 46
    );

    // Consolidate Items
    const pdfMap = new Map();
    (invoice.items || []).forEach((item) => {
      const name = item.medicine?.name || "Medicine";
      const key = `${name}___${item.unitType || "Tablet"}`;
      const qty = Number(item.displayQuantity || item.quantity || 1);
      const price = Number(item.sellingPrice || 0);
      const total = Number(item.total || qty * price);
      const unitType = item.unitType || "Tablet";
      const company = item.medicine?.company || "";

      if (pdfMap.has(key)) {
        const prev = pdfMap.get(key);
        prev.qty += qty;
        prev.total += total;
      } else {
        pdfMap.set(key, { name, qty, price, total, unitType, company });
      }
    });

    const consolidatedItems = Array.from(pdfMap.values());

    // Table Header
    let currentY = 206;
    doc.rect(40, currentY, 515, 22).fill(DARK_COLOR);

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
    doc.text("#", 48, currentY + 6, { width: 20 });
    doc.text("MEDICINE / ITEM DESCRIPTION", 72, currentY + 6, { width: 200 });
    doc.text("UNIT", 275, currentY + 6, { width: 60 });
    doc.text("QTY", 340, currentY + 6, { width: 45, align: "right" });
    doc.text("PRICE (Rs.)", 395, currentY + 6, { width: 70, align: "right" });
    doc.text("AMOUNT (Rs.)", 475, currentY + 6, { width: 70, align: "right" });

    currentY += 22;

    // Table Items Rows
    consolidatedItems.forEach((item, index) => {
      const rowHeight = 22;
      const isEven = index % 2 === 0;

      // Row background
      if (isEven) {
        doc.rect(40, currentY, 515, rowHeight).fill(BG_LIGHT);
      } else {
        doc.rect(40, currentY, 515, rowHeight).fill("#ffffff");
      }

      // Bottom cell divider
      doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, currentY + rowHeight).lineTo(555, currentY + rowHeight).stroke();

      doc.font("Helvetica").fontSize(8).fillColor(DARK_COLOR);
      doc.text(String(index + 1), 48, currentY + 6, { width: 20 });

      // Item Name
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(DARK_COLOR);
      doc.text(item.name, 72, currentY + 6, { width: 200, ellipsis: true });

      // Unit
      doc.font("Helvetica").fontSize(8).fillColor(TEXT_MUTED);
      doc.text(item.unitType, 275, currentY + 6, { width: 60 });

      // Qty
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(DARK_COLOR);
      doc.text(String(item.qty), 340, currentY + 6, { width: 45, align: "right" });

      // Price
      doc.font("Helvetica").fontSize(8).fillColor(DARK_COLOR);
      doc.text(Number(item.price).toFixed(2), 395, currentY + 6, { width: 70, align: "right" });

      // Total
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(DARK_COLOR);
      doc.text(Number(item.total).toFixed(2), 475, currentY + 6, { width: 70, align: "right" });

      currentY += rowHeight;
    });

    currentY += 12;

    // Bottom Section: Terms on Left, Totals on Right
    const summaryCardY = currentY;

    // Left Terms Box
    doc.roundedRect(40, summaryCardY, 260, 95, 6).fillAndStroke(BG_LIGHT, BORDER_COLOR);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(TEXT_MUTED).text("TERMS & CONDITIONS", 50, summaryCardY + 8);
    const termsText =
      "1. Medicines once sold will only be exchanged as per policy within 7 days with original invoice.\n" +
      "2. Opened or refrigerated medicines cannot be returned.\n" +
      "3. Please consult a registered doctor before use.\n" +
      "4. Computer generated invoice, physical stamp not required.";
    doc.font("Helvetica").fontSize(7).fillColor(TEXT_MUTED).text(termsText, 50, summaryCardY + 20, { width: 240, lineGap: 2 });

    // Right Totals Breakdown Box
    doc.roundedRect(315, summaryCardY, 240, 95, 6).fillAndStroke(BG_LIGHT, BORDER_COLOR);

    doc.font("Helvetica").fontSize(8).fillColor(DARK_COLOR);
    doc.text("Sub Total:", 325, summaryCardY + 10);
    doc.text(`Rs. ${Number(invoice.subTotal || 0).toFixed(2)}`, 455, summaryCardY + 10, { width: 90, align: "right" });

    doc.text("Discount:", 325, summaryCardY + 24);
    doc.text(`- Rs. ${Number(invoice.discount || 0).toFixed(2)}`, 455, summaryCardY + 24, { width: 90, align: "right" });

    doc.text("GST / Tax:", 325, summaryCardY + 38);
    doc.text(`+ Rs. ${Number(invoice.gst || 0).toFixed(2)}`, 455, summaryCardY + 38, { width: 90, align: "right" });

    // Grand Total Highlight Banner
    doc.rect(315, summaryCardY + 54, 240, 22).fill(PRIMARY_COLOR);
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#ffffff");
    doc.text("GRAND TOTAL:", 325, summaryCardY + 60);
    doc.text(`Rs. ${Number(invoice.grandTotal || 0).toFixed(2)}`, 455, summaryCardY + 60, { width: 90, align: "right" });

    // Paid & Due
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(DARK_COLOR);
    doc.text(`Paid: Rs. ${paidAmt.toFixed(2)}`, 325, summaryCardY + 81);
    doc.fillColor(dueAmt > 0 ? "#b91c1c" : "#15803d");
    doc.text(`Due: Rs. ${dueAmt.toFixed(2)}`, 455, summaryCardY + 81, { width: 90, align: "right" });

    // Signatory and Footer Note
    const footerY = summaryCardY + 115;
    doc.font("Helvetica").fontSize(8).fillColor(TEXT_MUTED).text("Thank you for choosing MediStock Pro!", 40, footerY, { align: "center", width: 515 });

    doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(395, footerY + 35).lineTo(545, footerY + 35).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(DARK_COLOR).text("Pharmacist / Authorized Signatory", 395, footerY + 40, { width: 150, align: "center" });

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
