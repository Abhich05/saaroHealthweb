const express = require('express');
const doctorProfileController = require('../controllers/doctorProfile.controller');

const doctorProfile = express.Router({ mergeParams: true });

doctorProfile.post(
  '/',
  doctorProfileController.createDoctorProfile,
);

doctorProfile.get(
  '/',
  doctorProfileController.getDoctorProfile,
);

doctorProfile.get(
  '/appointment',
  doctorProfileController.getAppointmentDetails
);

module.exports = doctorProfile;
