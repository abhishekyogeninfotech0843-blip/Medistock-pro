const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    batchNo: {
      type: String,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    minimumStock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Medicine", medicineSchema);
