const patientService = require('../services/patient.service');

const checkPatient = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await patientService.checkPatient(phone, doctorId);
    
    if (result?.error) {
      return res.status(result.statusCode).send(result.error);
    }

    res.status(result.statusCode).json({
      exists: result.exists,
      patient: result.patient
    });
  } catch (error) {
    console.error('Check Patient Error:', error);
    res.status(500).send(`Error: ${error}`);
  }
};

const registerPatient = async (req, res) => {
  try {
    console.log('registerPatient req.body:', req.body); // Debug log
    const patientData = req.body;
    const { doctorId } = req.params;

    const patient = await patientService.registerPatient(patientData, doctorId);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({
        patient: patient.patient,
      });
  } catch(error) {
    console.error('Register Patient Error:', error);
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const generateOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const patient = await patientService.generateOTP(phoneNumber);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({
        patient: patient.patient,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const validateOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const patient = await patientService.validateOTP(phoneNumber, otp);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({
        patient: patient.patient,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await patientService.getPatientById(patientId);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({
        patient: patient.patient,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page, limit, searchQuery, sortBy, sortDir } = req.query;

    const patients = await patientService.getAllPatients(doctorId, page, limit, searchQuery, sortBy, sortDir);

    res
      .status(patients.statusCode)
      .json({
        patient: patients.patients,
        pagination: patients.pagination,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patientData = req.body;

    const patient = await patientService.updatePatient(patientId, patientData);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({
        patient: patient.patient,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deletePatient = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const patient = await patientService.deletePatient(doctorId, patientId);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res.status(204).json({
      message: `Patient deleted successfully`,
    });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPatientByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const patient = await patientService.getPatientByUid(uid);
    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }
    res.status(patient.statusCode).json({ patient: patient.patient });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

module.exports = {
  checkPatient,
  registerPatient,
  generateOTP,
  validateOTP,
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient,
};
module.exports.getPatientByUid = getPatientByUid;
