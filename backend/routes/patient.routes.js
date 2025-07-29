const express = require('express');
const patientController = require('../controllers/patient.controller');
const patient = express.Router({ mergeParams: true });

patient.post(
  '/generate-otp',
  patientController.generateOTP,
);

patient.post(
  '/validate-otp',
  patientController.validateOTP,
);

patient.post(
  '/:doctorId',
  patientController.registerPatient,
);

patient.get(
  '/get-all/:doctorId',
  patientController.getAllPatients,
);

patient.get(
  '/:patientId',
  patientController.getPatientById,
);

patient.put(
  '/:patientId',
  patientController.updatePatient,
);

patient.delete(
  '/:doctorId/:patientId',
  patientController.deletePatient,
);

patient.get('/uid/:uid', patientController.getPatientByUid);

module.exports = patient;
