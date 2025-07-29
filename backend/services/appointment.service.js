const moment = require('moment');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const DoctorProfile = require('../models/doctorProfile');
const DoctorPatient = require('../models/doctorPatient');

const { generatePatientUid } = require('../utils/helpers');
const validateAppointment = require('../validations/appointment.validation');

const checkPatientAndGenerateOTP = async ( patientData, doctorId ) => {
  try {
    const {
      fullName,
      phoneNumber,
    } = patientData;

    if (
      !fullName
      || !phoneNumber
    ) {
      return {
        statusCode: 400,
        error: `Patient name and phone number is required`
      }
    }

    let patient = await Patient.findOne({ phoneNumber });
    // const otp = Math.floor(Math.random() * 9000) + 1000;
    const otp = 1234;

    if (!patient) {
      const uid = await generatePatientUid(doctorId);
      const newPatient = new Patient({
        uid,
        fullName,
        phoneNumber,
        otp,
      });
      await newPatient.save();

      const newDoctorPatient = new DoctorPatient({
        doctorId,
        patientId: newPatient._id,
        lastUpdated: new Date(),
      });
      await newDoctorPatient.save();

      patient = newPatient
    } else {
      const doctorPatient = await DoctorPatient.findOne({
        doctorId,
        patientId: patient._id,
      });

      if (!doctorPatient) {
        const newDoctorPatient = new DoctorPatient({
          doctorId,
          patientId: patient._id,
          lastUpdated: new Date(),
        });
        await newDoctorPatient.save();
      }

      patient = await Patient.findOneAndUpdate(
        { phoneNumber },
        { otp },
        { new: true },
      );
    }

    return {
      statusCode: 201,
      patient: `Patient registered and OTP sent to registered number`,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const validateOTP = async (patientData) => {
  try {
    const { phoneNumber, otp } = patientData;

    if (
      !phoneNumber
      || !otp
    ) {
      return {
        statusCode: 400,
        error: 'Phone number and otp is required'
      }
    }

    const patient = await Patient.findOne({ phoneNumber });
    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      }
    }

    if (patient.otp !== otp) {
      return {
        statusCode: 404,
        error: 'Incorrect OTP, please enter correct OTP',
      }
    }

    return {
      statusCode: 200,
      message: 'Patient validated successfully',
    }
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const bookAppointment = async (appointmentData, doctorId) => {
  try {
    const { phoneNumber } = appointmentData;

    if (!phoneNumber) {
      return {
        statusCode: 400,
        error: 'Phone number is required'
      }
    }

    const patient = await Patient.findOne({ phoneNumber });
    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      }
    }

    const appointment = await createAppointment(appointmentData, doctorId);

    if (appointment.error) {
      return {
        statusCode: appointment.statusCode,
        error: appointment.error,
      }
    }

    return {
      statusCode: appointment.statusCode,
      appointment: appointment.appointment,
    }
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const createAppointment = async ( appointmentData, doctorId ) => {
  try {
    const {
      date,
      location,
      time,
      type,
      phoneNumber,
    } = appointmentData;

    const appointmentDataValidation = validateAppointment(appointmentData);
    if (!appointmentDataValidation.success) {
      return {
        statusCode: 400,
        error: appointmentDataValidation.errors,
      };
    }

    const patient = await Patient.findOne({ phoneNumber });
    if (!patient) {
      return {
        statusCode: 404,
        error: 'Patient not found',
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Get only today's date (00:00:00 time)

    if (new Date(date) < today) {
      return {
        statusCode: 400,
        error: 'Please select a future date',
      };
    }

    let appointment = await Appointment.findOne({
      patientId: patient._id,
      date,
      location,
      time,
    });

    if (appointment) {
      return {
        statusCode: 409,
        error: 'Appointment already exist, Please select different date and time',
      };
    }

    const newAppointment = new Appointment({
      doctorId,
      patientId: patient._id,
      date,
      location,
      time,
      type,
    });
    await newAppointment.save();

    return {
      statusCode: 201,
      appointment: newAppointment,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getUpcomingAppointment = async ( patientId ) => {
  try {
    if (!patientId) {
      return {
        statusCode: 400,
        error: 'PatientId is required',
      };
    }

    const appointments = await Appointment.find({ patientId });
    const now = new Date();
    let latestAppointment = null;

    for (const appointment of appointments) {
      const [timePart, meridian] = appointment.time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (meridian === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridian === 'AM' && hours === 12) {
        hours = 0;
      }

      const appointmentDateTime = new Date(appointment.date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      if (appointmentDateTime > now) {
        if (
          !latestAppointment ||
          appointmentDateTime < latestAppointment.dateTime
        ) {
          latestAppointment = {
            dateTime: appointmentDateTime,
            details: appointment,
          };
        }
      }
    }

    if (latestAppointment) {
      return {
        statusCode: 200,
        appointment: latestAppointment.details,
      };
    }

    return {
      statusCode: 404,
      error: "No upcoming appointments found",
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllAppointments = async (patientId) => {
  try {
    if (!patientId) {
      return {
        statusCode: 400,
        error: 'PatientId is required',
      };
    }

    const appointments = await Appointment.find({ patientId });
    return {
      statusCode: 200,
      appointments: appointments,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllUpcomingAppointments = async (doctorId) => {
  try {
    if (!doctorId) {
      return {
        statusCode: 400,
        error: 'DoctorId is required',
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentTime = now.toTimeString().slice(0, 5);

    let appointments = await Appointment.find({
      doctorId,
      date: { $gte: todayStart },
      $or: [{ markComplete: false }, { markComplete: null }],
    })
      .sort({ date: 1, time: 1 })
      .populate('patientId')
      .exec();

    appointments = appointments.filter((appt) => {
      const apptDate = new Date(appt.date);
      const isToday = apptDate.toDateString() === todayStart.toDateString();
      return !isToday || appt.time >= currentTime;
    });

    return {
      statusCode: 200,
      appointments,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message || error,
    };
  }
}

const updateAppointment = async ( appointmentId, appointmentData ) => {
  try {
    const {
      date,
      location,
      time,
      type,
    } = appointmentData;

    const now = new Date();
    let [timePart, meridian] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (meridian === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }

    const newAppointmentDate = new Date(date);
    newAppointmentDate.setHours(hours, minutes, 0, 0);

    if (newAppointmentDate <= now) {
      return {
        statusCode: 400,
        error: 'The new appointment date and time must be in the future',
      };
    }

    if (!appointmentId) {
      return {
        statusCode: 400,
        error: 'Appointment Id is required',
      };
    }

    const appointmentDataValidation = validateAppointment(appointmentData);
    if (!appointmentDataValidation.success) {
      return {
        statusCode: 400,
        error: appointmentDataValidation.errors,
      };
    }

    let appointment = await Appointment.findById(appointmentId);
    if (
      !appointment
    ) {
      return {
        statusCode: 404,
        error: 'No appointment present',
      };
    }

    const appointmentDate = new Date(appointment.date);
    [timePart, meridian] = appointment.time.split(' ');
    [hours, minutes] = timePart.split(':').map(Number);

    if (meridian === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }

    appointmentDate.setHours(hours, minutes, 0, 0);
    if (appointmentDate < now) {
      return {
        statusCode: 400,
        error: 'This is a past prescription, Please update a future appointment',
      };
    }

    appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { date, location, time, type },
      { new: true },
    );

    return {
      statusCode: 200,
      appointment: appointment,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const updateAppointmentMarkComplete = async (appointmentData) => {
  try {
    if (
      !appointmentData.status
      || !appointmentData.ids.length
    ) {
      return {
        statusCode: 400,
        error: 'Appointment Ids and status are required',
      };
    }

    const updatedAppointments = [];
    for (const appointmentId of appointmentData.ids) {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { markComplete: true, status: appointmentData.status },
        { new: true },
      );

      if (appointment) {
        updatedAppointments.push(appointment);
      }
    }

    return {
      statusCode: 200,
      appointments: updatedAppointments,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAppointmentLocations = async (doctorId) => {
  try {
    if (!doctorId) {
      return {
        statusCode: 400,
        error: 'Doctor Id is required',
      };
    }

    const doctorProfile = await DoctorProfile.findOne({ doctorId })
      .populate('doctorId');

    if (!doctorProfile) {
      return {
        statusCode: 404,
        error: 'Doctor profile not found',
      };
    }

    return {
      statusCode: 200,
      locations: doctorProfile.locations,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const getAppointmentDates = async (doctorId, locationId) => {
  try {
    if (!doctorId || !locationId) {
      return {
        statusCode: 400,
        error: 'Doctor Id & Location Id is required',
      };
    }

    const doctorProfile = await DoctorProfile.findOne({ doctorId })
      .populate('doctorId');

    if (!doctorProfile) {
      return {
        statusCode: 404,
        error: 'Doctor profile not found',
      };
    }

    const location = doctorProfile.locations.find(
      (loc) => loc._id.toString() === locationId
    );

    if (!location) {
      return {
        statusCode: 404,
        error: 'Location not found',
      };
    }

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const days = location.days.map((day) => daysOfWeek.indexOf(day));
    const nextDates = [];

    const fromDate = new Date(doctorProfile?.unavailabilityDate?.from);
    const toDate = new Date(doctorProfile?.unavailabilityDate?.to);
    fromDate.setDate(fromDate.getDate() - 1);

    for (let i = 0; nextDates.length < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);

      if (
        days.includes(currentDate.getDay())
        && !(currentDate >= fromDate && currentDate <= toDate)
      ) {
        currentDate.setDate(currentDate.getDate());
        nextDates.push(currentDate.toLocaleDateString('en-CA'));
      }
    }

    return {
      statusCode: 200,
      dates: nextDates,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const getAppointmentTimeSlots = async (doctorId, locationId, date) => {
  try {
    if (!doctorId || !locationId || !date) {
      return {
        statusCode: 400,
        error: 'Doctor Id, Location Id, and Date are required',
      };
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const incomingDate = new Date(date);
    incomingDate.setHours(0, 0, 0, 0);

    if (incomingDate < todayDate) {
      return {
        statusCode: 400,
        error: 'Please select any future date',
      };
    }

    const doctorProfile = await DoctorProfile.findOne({ doctorId }).populate('doctorId');

    if (!doctorProfile) {
      return {
        statusCode: 404,
        error: 'Doctor profile not found',
      };
    }

    const location = doctorProfile.locations.find(
      (loc) => loc._id.toString() === locationId
    );

    if (!location) {
      return {
        statusCode: 404,
        error: 'Location not found',
      };
    }

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const selectedDate = new Date(date);
    const selectedDay = daysOfWeek[selectedDate.getDay()];

    if (!location.days.includes(selectedDay)) {
      return {
        statusCode: 400,
        error: `Appointments are not available on ${selectedDay} in ${location.address}, ${location.name}`,
      };
    }

    const [fromHour, fromMinutes, fromMeridian] = location.from.split(/[: ]/);
    const [toHour, toMinutes, toMeridian] = location.to.split(/[: ]/);

    const fromHour24 =
      fromMeridian === "PM" && parseInt(fromHour) !== 12
        ? parseInt(fromHour) + 12
        : fromMeridian === "AM" && parseInt(fromHour) === 12
        ? 0
        : parseInt(fromHour);

    const toHour24 =
      toMeridian === "PM" && parseInt(toHour) !== 12
        ? parseInt(toHour) + 12
        : toMeridian === "AM" && parseInt(toHour) === 12
        ? 0
        : parseInt(toHour);

    const fromTime = new Date(selectedDate);
    fromTime.setHours(parseInt(fromHour24), parseInt(fromMinutes), 0);

    const toTime = new Date(selectedDate);
    toTime.setHours(parseInt(toHour24), parseInt(toMinutes), 0);
    const timeslot = location.timeslot || 30;

    const now = new Date();
    let startTime = fromTime;

    if (selectedDate.toDateString() === now.toDateString()) {
      const minutes = now.getMinutes();
      const roundedMinutes = minutes % timeslot === 0 ? minutes : Math.ceil(minutes / timeslot) * timeslot;
      startTime = new Date(now.setMinutes(roundedMinutes, 0));
      if (startTime < fromTime) startTime = fromTime;

      startTime.setHours(startTime.getHours() + doctorProfile?.availabilityAfter);
    }

    const timeSlots = [];
    for (let time = startTime; time < toTime; time.setMinutes(time.getMinutes() + timeslot)) {
      timeSlots.push(new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    const appointmentBooked = await Appointment.find({
      doctorId,
      date: new Date(date),
      location: `${location.address}`,
    });

    const bookedTimes = appointmentBooked.map((appointment) => appointment.time);
    const availableTimeSlots = timeSlots.filter((slot) => {
      const formattedTime = slot.replace(/^0/, '');
      return !bookedTimes.includes(formattedTime);
    });

    return {
      statusCode: 200,
      timeSlots: availableTimeSlots,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

module.exports = {
  checkPatientAndGenerateOTP,
  validateOTP,
  bookAppointment,
  createAppointment,
  getUpcomingAppointment,
  getAllAppointments,
  getAllUpcomingAppointments,
  updateAppointment,
  updateAppointmentMarkComplete,
  getAppointmentLocations,
  getAppointmentDates,
  getAppointmentTimeSlots,
};
