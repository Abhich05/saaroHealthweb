const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    name: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Medical Report',
        'Lab Report',
        'X-Ray',
        'Prescription',
        'Discharge Summary',
        'Surgery Report',
        'Other'
      ]
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
module.exports = Document; 