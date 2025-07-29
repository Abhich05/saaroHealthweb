const mongoose = require('mongoose');

const medicineLibrarySchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    name: {
      index: true,
      required: true,
      type: String,
    },
    composition: {
      required: true,
      type: String,
    },
    frequency: {
      type: String,
      default: '',
    },
    dosage: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const MedicineLibrary = mongoose.model('MedicineLibrary', medicineLibrarySchema);
module.exports = MedicineLibrary;
