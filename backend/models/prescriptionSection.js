const mongoose = require('mongoose');

const prescriptionSectionSchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    label: {
      type: String,
      required: true,
    },
    fieldType: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
    },
    sectionType: {
      type: String,
      required: true,
    },
    printable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const PrescriptionSection = mongoose.model('PrescriptionSection', prescriptionSectionSchema);
module.exports = PrescriptionSection;
