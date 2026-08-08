const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    publicId: {
      type: String,
      unique: true,
      required: true,
    },

    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        sellingPrice: {
          type: Number,
          required: true,
        },

        total: {
          type: Number,
          required: true,
        },
      },
    ],

    subTotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Credit"],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "FAILED"],
      default: "PAID",
    },

    invoiceUrl: {
      type: String,
      default: "",
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
 