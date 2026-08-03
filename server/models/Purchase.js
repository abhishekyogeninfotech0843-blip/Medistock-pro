const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Purchase", purchaseSchema);
