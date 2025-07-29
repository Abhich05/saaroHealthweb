const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    invoiceId: {
      index: true,
      required: true,
      type: String,
      unique: true,
    },
    name: {
      required: true,
      type: String,
    },
    uid: {
      index: true,
      required: true,
      type: String,
    },
    phone: {
      required: true,
      type: String,
    },
    paymentStatus: {
      type: String,
      default: 'Unbilled',
    },
    privateNote: {
      type: String,
    },
    items: [
      {
        service: {
          type: String,
          default: null,
        },
        amount: {
          type: Number,
          default: 0,
        },
        quantity: {
          type: Number,
          default: 0,
        },
        discount: {
          type: Number,
          default: 0,
        },
      },
    ],
    additionalDiscountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      default: 'Cash',
    },
    patientNote: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
