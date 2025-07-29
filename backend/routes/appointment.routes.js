const express = require('express');
const appointmentController = require('../controllers/appointment.controller');

const appointment = express.Router({ mergeParams: true });

appointment.post(
  '/:doctorId/generate-otp',
  appointmentController.checkPatientAndGenerateOTP,
);

appointment.post(
  '/:doctorId/validate-otp',
  appointmentController.validateOTP,
);

appointment.post(
  '/:doctorId/book-appointment',
  appointmentController.bookAppointment,
);

appointment.post(
  '/:doctorId',
  appointmentController.createAppointment,
);

appointment.get(
  '/:doctorId/get-upcoming-appointments',
  appointmentController.getAllUpcomingAppointments,
)

appointment.get(
  '/:patientId/latest',
  appointmentController.getUpcomingAppointment,
);

appointment.get(
  '/:patientId',
  appointmentController.getAllAppointments,
);

appointment.patch(
  '/update-status',
  appointmentController.updateAppointmentStatus,
);

appointment.patch(
  '/:appointmentId',
  appointmentController.updateAppointment,
);

appointment.get(
  '/:doctorId/locations',
  appointmentController.getAppointmentLocations,
);

appointment.get(
  '/:doctorId/:locationId/dates',
  appointmentController.getAppointmentDates,
);

appointment.get(
  '/:doctorId/:locationId/date/:date',
  appointmentController.getAppointmentTimeSlots,
);

module.exports = appointment;
