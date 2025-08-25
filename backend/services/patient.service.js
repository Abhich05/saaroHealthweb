const mongoose = require('mongoose');
const Patient = require('../models/patient');
const DoctorPatient = require('../models/doctorPatient');
const { generatePatientUid, getAccessToken } = require('../utils/helpers');
const { validatePatient } = require('../validations/patient.validation');
const { sendTemplateMessage } = require('../utils/whatsapp');
const Prescription = require('../models/prescription');

const checkPatient = async (phoneNumber, doctorId) => {
  try {
    // Find patient by phone number
    const patient = await Patient.findOne({ phoneNumber });
    
    if (!patient) {
      return {
        statusCode: 200,
        exists: false,
        patient: null
      };
    }

    // Check if this patient is already associated with this doctor
    const doctorPatient = await DoctorPatient.findOne({ 
      patientId: patient._id, 
      doctorId 
    });

    return {
      statusCode: 200,
      exists: true,
      patient: patient
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message
    };
  }
};

const registerPatient = async ( patientData, doctorId ) => {
  try {
    const {
      title,
      fullName,
      phoneNumber,
      spouseName,
      alternatePhoneNumber,
      dateOfBirth,
      age,
      gender,
      email,
      address,
      bloodGroup,
      allergies,
      tags,
      referredBy,
      category,
    } = patientData;

    const patientValidation = validatePatient(patientData);
    if (!patientValidation.success) {
      return {
        statusCode: 400,
        error: patientValidation.errors,
      };
    }

    // Check if patient already exists with this phone number
    const existingPatient = await Patient.findOne({ phoneNumber });
    if (existingPatient) {
      // Check if this patient is already associated with this doctor
      const doctorPatient = await DoctorPatient.findOne({ 
        patientId: existingPatient._id, 
        doctorId 
      });

      if (doctorPatient) {
        return {
          statusCode: 409,
          error: `Patient with phone number ${phoneNumber} already exists for this doctor`,
        };
      }

      // If patient exists but not associated with this doctor, create the association
      const newDoctorPatient = new DoctorPatient({
        doctorId,
        patientId: existingPatient._id,
        lastUpdated: new Date(),
      });
      await newDoctorPatient.save();
      
      return {
        statusCode: 201,
        patient: existingPatient,
      };
    }

    const uid = await generatePatientUid();
    const newPatient = new Patient({
      uid,
      title,
      fullName,
      phoneNumber,
      spouseName,
      alternatePhoneNumber,
      dateOfBirth,
      age,
      gender,
      email,
      address,
      bloodGroup,
      allergies,
      tags,
      referredBy,
      category,
    });
    await newPatient.save();

    if (doctorId !== 'register') {
      const doctorPatient = new DoctorPatient({
        doctorId,
        patientId: newPatient._id,
      });
      await doctorPatient.save();
    }

    return {
      statusCode: 201,
      patient: newPatient,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const generateOTP = async (phoneNumber) => {
  try {
    const patient = await Patient.findOne({ phoneNumber });

    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }

    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    // await sendTemplateMessage(
    //   phoneNumber,
    //   'google_review',
    //   'en',
    //   [],
    // );

    await Patient.findOneAndUpdate(
      { phoneNumber },
      { otp: 1234 },
      { new: true },
    );

    return {
      statusCode: 200,
      patient,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const validateOTP = async (phoneNumber, otp) => {
  try {
    if (
      !otp
      || otp === null
      || otp === undefined
    ) {
      return {
        statusCode: 422,
        error: 'Missing field: OTP',
      }
    }
    const patient = await Patient.findOne({ phoneNumber });

    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }

    if ( patient.otp !== otp) {
      return {
        statusCode: 401,
        error: 'Wrong OTP',
      };
    }

    const accessToken = getAccessToken(patient.phoneNumber, patient.fullName);

    return {
      statusCode: 200,
      patient: {
        accessToken,
        phoneNumber,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getPatientById = async ( patientId ) => {
  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }

    return {
      statusCode: 200,
      patient,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllPatients = async (
  doctorId,
  page = 1,
  limit = 25,
  searchQuery = "",
  sortBy,
  sortDir
) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 25;
    const skip = (pageNumber - 1) * limitNumber;

    // Determine sort field and direction
    const sortMap = {
      uid: 'patient.uid',
      name: 'patient.fullName',
      phone: 'patient.phoneNumber',
      lastVisit: 'updatedAt', // from DoctorPatient timestamps
      category: 'patient.category',
    };
    const resolvedSortField = sortMap[sortBy] || 'updatedAt';
    const resolvedSortDir = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;

    // Build aggregation pipeline
    const docObjectId = mongoose.Types.ObjectId.isValid(doctorId)
      ? new mongoose.Types.ObjectId(doctorId)
      : doctorId;

    const pipeline = [
      // Match by doctor up front to keep pipeline narrow
      { $match: { doctorId: docObjectId } },
      // Join patient document
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: '$patient' },
    ];

    // Optional search across joined patient fields
    if (searchQuery) {
      const numericSearch = !isNaN(searchQuery) ? Number(searchQuery) : null;
      const searchOr = [
        { 'patient.fullName': { $regex: searchQuery, $options: 'i' } },
        { 'patient.uid': { $regex: searchQuery, $options: 'i' } },
      ];
      if (numericSearch !== null) {
        searchOr.push({ 'patient.phoneNumber': numericSearch });
      }
      pipeline.push({ $match: { $or: searchOr } });
    }

    // Use $facet to get paginated data and total count in a single round-trip
    pipeline.push({
      $facet: {
        data: [
          { $sort: { [resolvedSortField]: resolvedSortDir, _id: 1 } },
          { $skip: skip },
          { $limit: limitNumber },
          {
            $project: {
              _id: 1,
              doctorId: 1,
              createdAt: 1,
              updatedAt: 1,
              // Only send required patient fields to reduce payload
              patientId: {
                _id: '$patient._id',
                uid: '$patient.uid',
                fullName: '$patient.fullName',
                phoneNumber: '$patient.phoneNumber',
                category: '$patient.category',
                updatedAt: '$patient.updatedAt',
              },
            },
          },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    });

    const [result] = await DoctorPatient.aggregate(pipeline);
    const aggResults = result?.data || [];
    const totalPatients = (result?.totalCount?.[0]?.count) || 0;

    return {
      statusCode: 200,
      patients: aggResults,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalPatients / limitNumber) || 1,
        totalPatients,
        pageSize: limitNumber,
        hasNextPage: pageNumber * limitNumber < totalPatients,
        hasPrevPage: pageNumber > 1,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const updatePatient = async ( patientId, patientData ) => {
  try {
    const {
      fullName,
      phoneNumber,
      spouseName,
      alternatePhoneNumber,
      dateOfBirth,
      age,
      gender,
      email,
      address,
      bloodGroup,
      allergies,
      tags,
      referredBy,
    } = patientData;

    const patientValidation = validatePatient(patientData);
    if (!patientValidation.success) {
      return {
        statusCode: 400,
        error: patientValidation.errors,
      };
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        fullName,
        phoneNumber,
        spouseName,
        alternatePhoneNumber,
        dateOfBirth,
        age,
        gender,
        email,
        address,
        bloodGroup,
        allergies,
        tags,
        referredBy,
      },
      { new: true },
    );

    return {
      statusCode: 200,
      patient: updatedPatient,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deletePatient = async ( doctorId, patientId ) => {
  try {
    if (!doctorId || !patientId) {
      return {
        statusCode: 403,
        error: 'DoctorId & PatientId is required',
      };
    }

    const patient = await DoctorPatient.findOneAndDelete({ doctorId, patientId });

    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }

    return {};
  } catch (error) {
    return {
      statusCode: 500, 
      error: error,
    };
  }
}

const getPatientByUid = async (uid) => {
  try {
    const patient = await Patient.findOne({ uid });
    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }
    // Fetch past prescriptions for this patient
    const prescriptions = await Prescription.find({ patientId: patient._id })
      .sort({ createdAt: -1 });
    return {
      statusCode: 200,
      patient: { ...patient.toObject(), prescriptions },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
};

module.exports = {
  registerPatient,
  generateOTP,
  validateOTP,
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient,
};
module.exports.getPatientByUid = getPatientByUid;
