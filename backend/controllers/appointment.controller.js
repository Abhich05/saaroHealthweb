const appointmentService = require('../services/appointment.service');

const checkPatientAndGenerateOTP = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patientData = req.body;

    const patient = await appointmentService.checkPatientAndGenerateOTP(patientData, doctorId);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({ patient: patient.patient });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const validateOTP = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patientData = req.body;

    const patient = await appointmentService.validateOTP(patientData, doctorId);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({ message: patient.message });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointmentData = req.body;

    const patient = await appointmentService.bookAppointment(appointmentData, doctorId);
    if (patient?.error) {
      return res
        .status(patient.statusCode)
        .send(patient.error);
    }

    res
      .status(patient.statusCode)
      .json({ appointment: patient.appointment });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const createAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointmentData = req.body;

    const appointment = await appointmentService.createAppointment(appointmentData, doctorId);
    if (appointment?.error) {
      return res
        .status(appointment.statusCode)
        .send(appointment.error);
    }

    res
      .status(appointment.statusCode)
      .json({ appointment: appointment.appointment });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getUpcomingAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointment = await appointmentService.getUpcomingAppointment(patientId);
    if (appointment?.error) {
      return res
        .status(appointment.statusCode)
        .send(appointment.error);
    }

    res
      .status(appointment.statusCode)
      .json({ appointment: appointment.appointment });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await appointmentService.getAllAppointments(patientId);
    if (appointments?.error) {
      return res
        .status(appointments.statusCode)
        .send(appointments.error);
    }

    res
      .status(appointments.statusCode)
      .json({ appointments: appointments.appointments });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllUpcomingAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await appointmentService.getAllUpcomingAppointments(doctorId);
    if (appointments?.error) {
      return res
        .status(appointments.statusCode)
        .send(appointments.error);
    }

    res
      .status(appointments.statusCode)
      .json({ appointments: appointments.appointments });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentData = req.body;

    const appointment = await appointmentService.updateAppointmentMarkComplete(appointmentData);
    if (appointment?.error) {
      return res
        .status(appointment.statusCode)
        .send(appointment.error);
    }

    res
      .status(appointment.statusCode)
      .json({ appointments: appointment.appointments });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointmentData = req.body;

    const appointment = await appointmentService.updateAppointment(appointmentId, appointmentData);
    if (appointment?.error) {
      return res
        .status(appointment.statusCode)
        .send(appointment.error);
    }

    res
      .status(appointment.statusCode)
      .json({ appointment: appointment.appointment });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAppointmentLocations = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const locations = await appointmentService.getAppointmentLocations(doctorId);
    if (locations?.error) {
      return res
        .status(locations.statusCode)
        .send(locations.error);
    }

    res
      .status(locations.statusCode)
      .json({ locations: locations.locations });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAppointmentDates = async (req, res) => {
  try {
    const { doctorId, locationId } = req.params;

    const dates = await appointmentService.getAppointmentDates(doctorId, locationId);
    if (dates?.error) {
      return res
        .status(dates.statusCode)
        .send(dates.error);
    }

    res
      .status(dates.statusCode)
      .json({ dates: dates.dates });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAppointmentTimeSlots = async (req, res) => {
  try {
    const { doctorId, locationId, date } = req.params;

    const timeSlots = await appointmentService.getAppointmentTimeSlots(doctorId, locationId, date);
    if (timeSlots?.error) {
      return res
        .status(timeSlots.statusCode)
        .send(timeSlots.error);
    }

    res
      .status(timeSlots.statusCode)
      .json({ timeSlots: timeSlots.timeSlots });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  checkPatientAndGenerateOTP,
  validateOTP,
  bookAppointment,
  createAppointment,
  getUpcomingAppointment,
  getAllAppointments,
  getAllUpcomingAppointments,
  updateAppointmentStatus,
  updateAppointment,
  getAppointmentLocations,
  getAppointmentDates,
  getAppointmentTimeSlots,
};
