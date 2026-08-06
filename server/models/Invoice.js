const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    payment: {
      type: String,
      default: "UPI / GPay",
      trim: true,
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

        displayQuantity: {
          type: Number,
          required: true,
        },

        unitType: {
          type: String,
          enum: [
            "Tablet",
            "Strip",
            "Capsule",
            "Injection",
            "Ointment",
            "Other",
          ],
          default: "Tablet",
        },

        packSize: {
          type: Number,
          default: 10,
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
