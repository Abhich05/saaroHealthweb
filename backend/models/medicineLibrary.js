const mongoose = require('mongoose');

const medicineLibrarySchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    medicineName: {
      index: true,
      required: true,
      type: String,
      unique: true,
    },
    composition: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const MedicineLibrary = mongoose.model('MedicineLibrary', medicineLibrarySchema);
module.exports = MedicineLibrary;
