const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema(
  {
    prescriptionId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    type: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
    date: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Surgery = mongoose.model('Surgery', surgerySchema);
module.exports = Surgery;
