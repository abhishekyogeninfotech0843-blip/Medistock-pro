const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Sale", saleSchema);
