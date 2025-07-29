const express = require('express');
const doctorProfileController = require('../controllers/doctorProfile.controller');

const patientAppointment = express.Router({ mergeParams: true });

patientAppointment.get(
  '/doctor-profile',
  doctorProfileController.getDoctorProfile,
);

// patientAppointment.get(
//   '/appointment',
//   doctorProfileController.getAppointmentDetails
// )

module.exports = patientAppointment;
