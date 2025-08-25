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

// Helpful indexes for common queries
fileUploaderSchema.index({ doctorId: 1, type: 1, updatedAt: -1 });
fileUploaderSchema.index({ patientId: 1, type: 1, updatedAt: -1 });

fileUploaderSchema.statics.getPaginatedIpdRecords = async function({ doctorId, page = 1, limit = 7, searchQuery = "", sortBy = 'updatedAt', sortDir = 'desc' }) {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 7;
    const skip = (pageNumber - 1) * limitNumber;

    const match = { type: 'ipd' };
    if (doctorId) {
      try {
        match.doctorId = new mongoose.Types.ObjectId(doctorId);
      } catch {
        match.doctorId = doctorId; // fallback if already ObjectId
      }
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient',
          pipeline: [
            { $project: { _id: 1, uid: 1, fullName: 1, phoneNumber: 1 } },
          ],
        },
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
    ];

    if (searchQuery) {
      const q = String(searchQuery);
      const or = [
        { admissionDate: { $regex: q, $options: 'i' } },
        { dischargeDate: { $regex: q, $options: 'i' } },
        { 'patient.fullName': { $regex: q, $options: 'i' } },
        { 'patient.uid': { $regex: q, $options: 'i' } },
      ];
      // If numeric, also match phone numbers
      if (/^\d{3,}$/.test(q)) {
        or.push({ 'patient.phoneNumber': Number(q) });
      }
      pipeline.push({ $match: { $or: or } });
    }

    const allowedSort = new Set(['updatedAt', 'admissionDate', 'dischargeDate', 'status']);
    const sortField = allowedSort.has(String(sortBy)) ? String(sortBy) : 'updatedAt';
    const sortDirection = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;

    pipeline.push({
      $facet: {
        data: [
          { $sort: { [sortField]: sortDirection, _id: 1 } },
          { $skip: skip },
          { $limit: limitNumber },
          {
            $project: {
              _id: 1,
              doctorId: 1,
              patientId: 1,
              type: 1,
              admissionDate: 1,
              dischargeDate: 1,
              status: 1,
              updatedAt: 1,
              createdAt: 1,
              patient: 1,
            },
          },
        ],
        totalCount: [ { $count: 'count' } ],
      },
    });

    const [result] = await this.aggregate(pipeline).exec();
    const data = result?.data || [];
    const totalFiles = (result?.totalCount?.[0]?.count) || 0;
    return {
      files: data,
      pagination: { totalFiles, page: pageNumber, limit: limitNumber },
    };
  } catch (error) {
    return { error };
  }
};

const FileUploader = mongoose.model('FileUploader', fileUploaderSchema);
module.exports = FileUploader;
