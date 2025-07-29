const Appointment = require('../models/appointment');

exports.getPatientQueue = async (req, res) => {
  const { doctorId } = req.params;
  const { todayPage = 1, todayLimit = 7, tomorrowPage = 1, tomorrowLimit = 7, upcomingPage = 1, upcomingLimit = 7 } = req.query;
  const today = new Date();
  today.setHours(0,0,0,0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const upcoming = new Date(tomorrow);
  upcoming.setDate(tomorrow.getDate() + 1);

  // Helper to get queue for a date range
  const getQueue = async (start, end, page, limit) => {
    const allAppointments = await Appointment.find({
      doctorId,
      date: { $gte: start, $lt: end }
    }).populate('patientId');
    const total = allAppointments.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const appointments = allAppointments.slice(skip, skip + parseInt(limit));
    return {
      data: appointments.map(appt => ({
        token: appt._id,
        name: appt.patientId?.fullName || '',
        ageGender: appt.patientId ? `${appt.patientId.age || '-'} / ${appt.patientId.gender || '-'}` : '-',
        type: appt.type,
        time: appt.time,
        status: appt.status ? appt.status[0].toUpperCase() + appt.status.slice(1).toLowerCase() : '',
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      }
    };
  };

  try {
    const Today = await getQueue(today, tomorrow, todayPage, todayLimit);
    const Tomorrow = await getQueue(tomorrow, upcoming, tomorrowPage, tomorrowLimit);
    const allUpcoming = await Appointment.find({
      doctorId,
      date: { $gte: upcoming }
    }).populate('patientId');
    const upcomingTotal = allUpcoming.length;
    const upcomingSkip = (parseInt(upcomingPage) - 1) * parseInt(upcomingLimit);
    const upcomingAppointments = allUpcoming.slice(upcomingSkip, upcomingSkip + parseInt(upcomingLimit));
    const Upcoming = {
      data: upcomingAppointments.map(appt => ({
        token: appt._id,
        name: appt.patientId?.fullName || '',
        ageGender: appt.patientId ? `${appt.patientId.age || '-'} / ${appt.patientId.gender || '-'}` : '-',
        type: appt.type,
        time: appt.time,
        status: appt.status ? appt.status[0].toUpperCase() + appt.status.slice(1).toLowerCase() : '',
      })),
      pagination: {
        total: upcomingTotal,
        page: parseInt(upcomingPage),
        limit: parseInt(upcomingLimit),
      }
    };
    res.json({
      Today: Today.data,
      Tomorrow: Tomorrow.data,
      Upcoming: Upcoming.data,
      pagination: {
        Today: Today.pagination,
        Tomorrow: Tomorrow.pagination,
        Upcoming: Upcoming.pagination,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 