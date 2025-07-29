const Doctor = require('../models/doctor');
const validateDoctor = require('../validations/doctor.validation');
const {
  getHashedPassword,
  comparePassword,
  getAccessToken,
} = require('../utils/helpers');

const registerDoctor = async ( doctorData ) => {
  try {
    const {
      name,
      rmcNumber,
      phoneNumber,
      email,
      address,
      clinicName,
      password,
    } = doctorData;

    const doctorDataValidation = validateDoctor(doctorData);
    if (!doctorDataValidation.success) {
      return {
        statusCode: 400,
        error: doctorDataValidation.errors,
      };
    }

    let doctor =
      await Doctor.findOne({ phoneNumber })
      || await Doctor.findOne({ email });

    if (doctor) {
      return {
        statusCode: 409,
        error: 'Doctor already exist, Please use different email/phone number or login',
      };
    }

    const hashedPassword = await getHashedPassword(password);
    const newDoctor = new Doctor({
      name,
      rmcNumber,
      phoneNumber,
      email,
      address,
      clinicName,
      password: hashedPassword,
    });
    await newDoctor.save();

    return {
      statusCode: 201,
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        rmcNumber: newDoctor.rmcNumber,
        phoneNumber: newDoctor.phoneNumber,
        email: newDoctor.email,
        address: newDoctor.address,
        clinicName: newDoctor.clinicName,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const loginDoctor = async ( doctorData ) => {
  try {
    const {
      email,
      phoneNumber,
      password,
    } = doctorData;

    if (
      !(email || phoneNumber)
      && password
    ) {
      return {
        statusCode: 400,
        error: 'Please fill all the fields',
      };
    }
  
    const doctor =
      await Doctor.findOne({ email })
      || await Doctor.findOne({ phoneNumber });

    if (!doctor) {
      return {
        statusCode: 404,
        error: 'Doctor not found',
      };
    }
  
    const isPasswordValid = await comparePassword(password, doctor.password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        error: 'Wrong Password',
      };
    }
  
    const accessToken = getAccessToken(doctor);
    return {
      statusCode: 200,
      doctor: {
        id: doctor._id,
        accessToken,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getDoctor = async ( doctorId ) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return {
        statusCode: 404,
        error: 'Doctor not found',
      };
    }
    
    return {
      statusCode: 200,
      doctor: {
        id: doctorId,
        name: doctor.name,
        rmcNumber: doctor.rmcNumber,
        phoneNumber: doctor.phoneNumber,
        email: doctor.email,
        address: doctor.address,
        clinicName: doctor.clinicName,
        mobile: doctor.mobile,
        experience: doctor.experience,
        specialization: doctor.specialization,
        education: doctor.education,
        bio: doctor.bio,
        avatar: doctor.avatar,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deleteDoctor = async (doctorId) => {
  try {
    await Doctor.findByIdAndDelete(doctorId);
    return {
      statusCode: 204,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

module.exports = {
  registerDoctor,
  loginDoctor,
  getDoctor,
  deleteDoctor, 
};
