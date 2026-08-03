const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

// ==========================
// Routes
// ==========================
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const customerRoutes = require("./routes/customerRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockLedgerRoutes = require("./routes/stockLedgerRoutes");
const stockDashboardRoutes = require("./routes/stockDashboardRoutes");
const topSellingRoutes = require("./routes/topSellingRoutes");
const alertDashboardRoutes = require("./routes/alertDashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ==========================
// Scheduler
// ==========================
const expiryScheduler = require("./schedulers/expiryScheduler");

// Config
dotenv.config();

// Database Connection
connectDB();

const app = express();

// ==========================
// Middleware
// ==========================
app.use(cors());

app.use(express.json());

// ==========================
// Home Route
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 MediStock Pro API Running...");
});

// ==========================
// API Routes
// ==========================
app.use("/api/auth", authRoutes);

app.use("/api/medicines", medicineRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/sales", saleRoutes);

app.use("/api/invoices", invoiceRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/stock-ledger", stockLedgerRoutes);

app.use("/api/stock-dashboard", stockDashboardRoutes);

app.use("/api/top-selling", topSellingRoutes);

app.use("/api/inventory-alerts", alertDashboardRoutes);

app.use("/api/notifications", notificationRoutes);

// ==========================
// Start Scheduler
// ==========================
expiryScheduler();

// ==========================
// Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});
