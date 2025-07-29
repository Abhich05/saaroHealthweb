const mongoose = require('mongoose');

const fileUploaderSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      index: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    admissionDate: {
      type: String,
    },
    dischargeDate: {
      type: String,
    },
    status: {
      type: String,
      default: 'Admitted',
    },
  },
  {
    timestamps: true,
  },
);

fileUploaderSchema.statics.getPaginatedIpdRecords = async function({ doctorId, page = 1, limit = 7, searchQuery = "" }) {
  try {
    const filter = { type: 'ipd' };
    if (doctorId) filter.doctorId = doctorId;
    if (searchQuery) {
      filter.$or = [
        { admissionDate: { $regex: searchQuery, $options: 'i' } },
        { dischargeDate: { $regex: searchQuery, $options: 'i' } },
        // Add more fields as needed
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [files, totalFiles] = await Promise.all([
      this.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('patientId'),
      this.countDocuments(filter),
    ]);
    return {
      files,
      pagination: {
        totalFiles,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    return { error };
  }
};

const FileUploader = mongoose.model('FileUploader', fileUploaderSchema);
module.exports = FileUploader;
