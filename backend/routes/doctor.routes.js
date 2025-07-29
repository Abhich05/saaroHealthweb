const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const doctorMiddleware = require('../middlewares/doctor.middleware');
const patientQueueController = require('../controllers/patientQueue.controller');

const doctor = express.Router({ mergeParams: true });

doctor.post(
  '/',
  doctorController.registerDoctor,
);

doctor.post(
  '/access-token',
  doctorController.loginDoctor,
);

doctor.get('/first', doctorController.getFirstDoctor);

// Route for getting doctor info (used by frontend)
doctor.get(
  '/:doctorId',
  doctorController.getDoctor,
);

// Route for getting doctor info with authentication
doctor.get(
  '/:doctorId/profile',
  doctorMiddleware,
  doctorController.getDoctor,
);

// Password change route (requires doctor authentication)
doctor.put(
  '/change-password',
  doctorMiddleware,
  doctorController.changePassword,
);

// Profile update route (requires doctor authentication)
doctor.put(
  '/:doctorId/profile',
  doctorMiddleware,
  doctorController.updateProfile,
);

// For debugging: temporarily remove doctorMiddleware from patient-queue route
// doctor.get('/:doctorId/patient-queue', doctorMiddleware, patientQueueController.getPatientQueue);
doctor.get('/:doctorId/patient-queue', patientQueueController.getPatientQueue);

doctor.delete(
  '/:doctorId',
  doctorMiddleware,
  doctorController.deleteDoctor,
);

module.exports = doctor;
