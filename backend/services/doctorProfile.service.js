const moment = require('moment');
const DoctorProfile = require('../models/doctorProfile');
const validateDoctorProfile = require('../validations/doctorProfile.validation');
const { validateLocationSchedule } = require('../utils/doctorTiming');

const createDoctorProfile = async (doctorId, profileData) =>  {
  try {
    const {
      introduction,
      happyClients,
      experience,
      about,
      locations,
      unavailabilityDate,
      availabilityAfter,
    } = profileData;

    const profileDataValidation = validateDoctorProfile(profileData);
    if (!profileDataValidation.success) {
      return {
        statusCode: 400,
        error: profileDataValidation.errors,
      };
    }

    const validationOfLocation = validateLocationSchedule(locations);
    if (!validationOfLocation.success) {
      return {
        statusCode: 400,
        error: validationOfLocation.message,
      };
    }

    const doctorProfile = await DoctorProfile.findOne({ doctorId });
    if (doctorProfile) {
      const updatedDoctorProfile = await DoctorProfile.findOneAndUpdate(
        { doctorId },
        {
          introduction,
          happyClients,
          experience,
          about,
          locations,
          unavailabilityDate,
          availabilityAfter,
        },
      );

      return {
        statusCode: 200,
        doctorProfile: updatedDoctorProfile,
      };
    }

    const newDoctorProfile = new DoctorProfile({
      doctorId,
      introduction,
      happyClients,
      experience,
      about,
      locations,
      unavailabilityDate,
      availabilityAfter,
    });
    await newDoctorProfile.save();

    return {
      statusCode: 201,
      doctorProfile: newDoctorProfile,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getDoctorProfile = async (doctorId) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ doctorId })
      .populate('doctorId');

    return {
      statusCode: 200,
      doctorProfile,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAppointmentDetails = async (doctorId) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ doctorId })
      .populate('doctorId');

    if (!doctorProfile) {
      return {
        statusCode: 404,
        message: 'Doctor profile not found',
      };
    }

    const now = moment();
    const appointmentStartTime = now.add((doctorProfile.delayTimeInHours || 0), 'hours');

    const getNextWeekday = (targetDay, startDate) => {
      let daysToAdd = (targetDay - startDate.day() + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7;
      return startDate.add(daysToAdd, 'days');
    };

    const generateTimeSlots = (from, to, timeslotDuration) => {
      const slots = [];
      const startTime = moment(from, 'hh:mm A');
      const endTime = moment(to, 'hh:mm A');
      const slotDuration = timeslotDuration;

      while (startTime < endTime) {
        slots.push(startTime.format('h:mm A'));
        startTime.add(slotDuration, 'minutes');
      }
      return slots;
    };

    const appointmentDetails = doctorProfile.locations.map((location) => {
      const availableDays = location.days;
      const slotsPerLocation = [];

      let nextAppointmentDate = appointmentStartTime.clone();
      let appointmentsCount = 0;

      while (appointmentsCount < 7) {
        let targetDay = availableDays[appointmentsCount % availableDays.length];
        const targetDayIndex = moment.weekdays().indexOf(targetDay);
        let nextAvailableDate = getNextWeekday(targetDayIndex, nextAppointmentDate.clone());
        const timeSlots = generateTimeSlots(location.from, location.to, location.timeslot);

        slotsPerLocation.push({
          day: targetDay,
          date: nextAvailableDate.format('YYYY-MM-DD'),
          timeSlots: timeSlots,
        });

        nextAppointmentDate = nextAvailableDate.clone().add(1, 'days');
        appointmentsCount++;
      }

      return {
        locationName: location.name,
        appointmentSlots: slotsPerLocation,
      };
    });

    return {
      statusCode: 200,
      doctorProfile: {
        ...doctorProfile.toObject(),
        appointmentDetails,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

module.exports = {
  createDoctorProfile,
  getDoctorProfile,
  getAppointmentDetails,
};
