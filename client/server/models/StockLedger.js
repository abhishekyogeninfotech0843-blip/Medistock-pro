const mongoose = require("mongoose");

const stockLedgerSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    type: {
      type: String,
      enum: ["STOCK_IN", "STOCK_OUT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    reference: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("StockLedger", stockLedgerSchema);
