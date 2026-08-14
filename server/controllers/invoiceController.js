const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const Medicine = require("../models/Medicine");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");

const normalizePayment = (payment) => {
  let paymentMethod = (payment || "").toString().trim();
  if (!paymentMethod) {
    return "UPI / GPay";
  }
  const p = paymentMethod.toLowerCase();
  if (p.includes("cash")) return "Cash";
  if (p.includes("card") || p.includes("debit") || p.includes("credit"))
    return "Card";
  if (p.includes("upi") || p.includes("gpay") || p.includes("qr"))
    return "UPI / GPay";
  return paymentMethod;
};

// ==========================
// Create Invoice
// ==========================
const createInvoice = async (req, res) => {
  try {
    const { customerName, items: rawItems, discount, gst, payment, paidAmount, customerMobile } = req.body;

    // Consolidate duplicate medicine entries in rawItems
    const consolidatedMap = new Map();
    (rawItems || []).forEach((item) => {
      const medId = String(item.medicine || "");
      if (!medId) return;

      if (consolidatedMap.has(medId)) {
        const existing = consolidatedMap.get(medId);
        existing.displayQuantity =
          (Number(existing.displayQuantity) || Number(existing.quantity) || 1) +
          (Number(item.displayQuantity) || Number(item.quantity) || 1);
        existing.quantity =
          (Number(existing.quantity) || 1) + (Number(item.quantity) || 1);
      } else {
        consolidatedMap.set(medId, { ...item });
      }
    });
    const items = Array.from(consolidatedMap.values());

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

      const validUnitTypes = [
        "Tablet",
        "Strip",
        "Capsule",
        "Injection",
        "Ointment",
        "Other",
      ];
      const packSize = Number(item.packSize || medicine.packSize || 10);
      const displayQuantity = Number(
        item.displayQuantity || item.quantity || 1,
      );
      const unitType = validUnitTypes.includes(item.unitType)
        ? item.unitType
        : "Tablet";
      const actualQuantity =
        unitType === "Strip" ? displayQuantity * packSize : displayQuantity;

      if (medicine.stock < actualQuantity) {
        return res.status(400).json({
          success: false,
          message: `${medicine.name} has insufficient stock`,
        });
      }

      const unitPrice =
        unitType === "Strip"
          ? Number(medicine.sellingPrice)
          : Number((medicine.sellingPrice / packSize).toFixed(2));

      item.sellingPrice = unitPrice;
      item.total = displayQuantity * unitPrice;
      item.quantity = actualQuantity;
      item.displayQuantity = displayQuantity;
      item.unitType = unitType;
      item.packSize = packSize;

      subTotal += item.total;
    }

    const grandTotal = subTotal - Number(discount || 0) + Number(gst || 0);

    const finalPaidAmount =
      paidAmount !== undefined && paidAmount !== null && paidAmount !== ""
        ? Math.min(grandTotal, Math.max(0, Number(paidAmount)))
        : grandTotal;
    const dueAmount = Math.max(0, grandTotal - finalPaidAmount);

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
      customerMobile: customerMobile || "",
      invoiceNumber,
      payment: payment || "UPI / GPay",
      items,
      subTotal,
      discount,
      gst,
      grandTotal,
      paidAmount: finalPaidAmount,
      dueAmount,
    });

    // Update Customer due balance if customer name is provided
    if (customerName && customerName.trim().toLowerCase() !== "walk-in patient") {
      let cust = await Customer.findOne({
        name: { $regex: `^${customerName.trim()}$`, $options: "i" },
      });
      if (!cust) {
        await Customer.create({
          name: customerName.trim(),
          mobile: customerMobile || "",
          dueBalance: dueAmount,
        });
      } else {
        cust.dueBalance = (cust.dueBalance || 0) + dueAmount;
        if (customerMobile && !cust.mobile) {
          cust.mobile = customerMobile;
        }
        await cust.save();
      }
    }

    const populatedInvoice = await Invoice.findById(invoice._id).populate(
      "items.medicine",
      "name company",
    );

    res.status(201).json({
      success: true,
      message: "Invoice Created Successfully",
      data: populatedInvoice,
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
// Update Invoice Payment
// ==========================
const updatePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { payment } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Invoice id required",
      });
    }

    const normalizedPayment = normalizePayment(payment);

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { payment: normalizedPayment },
      { new: true },
    ).populate("items.medicine", "name company");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
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
// Download Invoice PDF
// ==========================
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "items.medicine",
      "name company",
    );

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
      `attachment; filename=${invoice.invoiceNumber}.pdf`,
    );

    doc.pipe(res);

    // ==========================
    // Header
    // ==========================
    doc.fontSize(22).text("MEDISTOCK PRO", {
      align: "center",
    });

    doc.fontSize(12).text("Pharmacy Management System", {
      align: "center",
    });

    doc.moveDown();

    doc.text(`Invoice No : ${invoice.invoiceNumber}`);
    doc.text(`Customer   : ${invoice.customerName}`);
    doc.text(`Date       : ${invoice.invoiceDate.toDateString()}`);

    doc.moveDown();

    // Table Header
    doc.font("Courier").fontSize(10);
    doc.text("-------------------------------------------------------------");
    doc.text("Medicine                      Qty    Price    Total");
    doc.text("-------------------------------------------------------------");

    // Items (Consolidated)
    const pdfMap = new Map();
    (invoice.items || []).forEach((item) => {
      const name = item.medicine?.name || "Medicine";
      const key = `${name}___${item.unitType || "Tablet"}`;
      const qty = Number(item.displayQuantity || item.quantity || 1);
      const price = Number(item.sellingPrice || 0);
      const total = Number(item.total || qty * price);

      if (pdfMap.has(key)) {
        const prev = pdfMap.get(key);
        prev.qty += qty;
        prev.total += total;
      } else {
        pdfMap.set(key, { name, qty, price, total });
      }
    });

    Array.from(pdfMap.values()).forEach((item) => {
      const line = `${item.name.padEnd(28, " ")} ${String(item.qty).padStart(3, " ")}    ${String(item.price).padStart(6, " ")}    ${String(item.total).padStart(6, " ")}`;
      doc.text(line);
    });

    doc.moveDown();

    doc.text("-------------------------------------------------------------");
    doc.text(`Subtotal  : Rs. ${invoice.subTotal}`);
    doc.text(`Discount  : Rs. ${invoice.discount}`);
    doc.text(`GST       : Rs. ${invoice.gst}`);

    doc.fontSize(14).text(`Grand Total : Rs. ${invoice.grandTotal}`);
    doc.fontSize(12);

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
        {
          customerMobile: {
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
// Update Invoice Due Payment
// ==========================
const updateInvoiceDue = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { amountPaidNow } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const paymentAmount = Number(amountPaidNow || 0);
    if (paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid payment amount required" });
    }

    const previousDue = invoice.dueAmount || 0;
    const actualPay = Math.min(previousDue, paymentAmount);

    invoice.paidAmount = (invoice.paidAmount || 0) + actualPay;
    invoice.dueAmount = Math.max(0, (invoice.dueAmount || 0) - actualPay);
    await invoice.save();

    // Reduce Customer dueBalance if customer exists
    if (invoice.customerName && invoice.customerName.toLowerCase() !== "walk-in patient") {
      const cust = await Customer.findOne({
        name: { $regex: `^${invoice.customerName.trim()}$`, $options: "i" },
      });
      if (cust) {
        cust.dueBalance = Math.max(0, (cust.dueBalance || 0) - actualPay);
        await cust.save();
      }
    }

    const updatedInvoice = await Invoice.findById(invoiceId).populate(
      "items.medicine",
      "name company"
    );

    res.status(200).json({
      success: true,
      message: `Payment of ₹${actualPay} recorded successfully`,
      data: updatedInvoice,
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
  updatePayment,
  downloadInvoicePDF,
  searchInvoices,
  updateInvoiceDue,
};

