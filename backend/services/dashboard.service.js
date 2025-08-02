const Invoice = require('../models/invoice');
const Appointment = require('../models/appointment');
const Prescription = require('../models/prescription');
const DoctorPatient = require('../models/doctorPatient');
const Message = require('../models/message');

const getPatient24HourReport = async (doctorId) => {
  try {
    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const patients = await DoctorPatient.find({
      doctorId,
      createdAt: { $gte: past24Hours }
    }).sort({ createdAt: 1 });

    const hourlyReport = new Array(24).fill(0);
    patients.forEach(patient => {
      const patientHour = Math.floor((patient.createdAt - past24Hours) / (60 * 60 * 1000));
      if (patientHour >= 0 && patientHour < 24) {
        hourlyReport[patientHour]++;
      }
    });

    return {
      statusCode: 200,
      patients: hourlyReport,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getPatient30DaysReport = async (doctorId) => {
  try {
    const now = new Date();
    const past30Days = new Date();
    past30Days.setDate(now.getDate() - 30);

    const patients = await DoctorPatient.find({
      doctorId,
      createdAt: { $gte: past30Days }
    }).sort({ createdAt: 1 });

    const dailyReport = new Array(30).fill(0);

    patients.forEach(patient => {
      const patientDate = new Date(patient.createdAt);
      const dayIndex = Math.floor((patientDate - past30Days) / (24 * 60 * 60 * 1000));

      if (dayIndex >= 0 && dayIndex < 30) {
        dailyReport[dayIndex]++;
      }
    });

    return {
      statusCode: 200,
      patients: dailyReport,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getInvoice12MonthsReport = async (doctorId) => {
  try {
    const now = new Date();
    const past12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const invoices = await Invoice.find({
      doctorId,
      createdAt: { $gte: past12Months },
    }).sort({ createdAt: 1 });

    const monthlyReport = new Array(12).fill(0);

    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      const yearDifference = invoiceDate.getFullYear() - past12Months.getFullYear();
      const monthDifference = invoiceDate.getMonth() - past12Months.getMonth();
      const monthIndex = yearDifference * 12 + monthDifference;

      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyReport[monthIndex]++;
      }
    });

    return {
      statusCode: 200,
      invoices: monthlyReport,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getPayment12MonthsReport = async (doctorId) => {
  try {
    const now = new Date();
    const past12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const invoices = await Invoice.find({
      doctorId,
      createdAt: { $gte: past12Months },
    }).sort({ createdAt: 1 });

    const monthlyReport = new Array(12).fill(0);

    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      const yearDifference = invoiceDate.getFullYear() - past12Months.getFullYear();
      const monthDifference = invoiceDate.getMonth() - past12Months.getMonth();
      const monthIndex = yearDifference * 12 + monthDifference;

      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyReport[monthIndex] += invoice.totalAmount ? invoice.totalAmount : 0;
      }
    });

    return {
      statusCode: 200,
      payments: monthlyReport,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getComparisonData = async (doctorId) => {
  try {
    const { start: thisMonthStart, end: thisMonthEnd } = getDateRange();
    const { start: lastMonthStart, end: lastMonthEnd } = getDateRange(-1);

    const [thisMonthInvoices, lastMonthInvoices] = await Promise.all([
      Invoice.countDocuments({ createdAt: { $gte: thisMonthStart, $lt: thisMonthEnd } }),
      Invoice.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } }),
    ]);

    const [thisMonthPrescriptions, lastMonthPrescriptions] = await Promise.all([
      Prescription.countDocuments({ createdAt: { $gte: thisMonthStart, $lt: thisMonthEnd } }),
      Prescription.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } }),
    ]);

    const [thisMonthDoctorPatients, lastMonthDoctorPatients] = await Promise.all([
      DoctorPatient.countDocuments({ createdAt: { $gte: thisMonthStart, $lt: thisMonthEnd }, doctorId }),
      DoctorPatient.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }, doctorId }),
    ]);

    const [thisMonthAppointments, lastMonthAppointments] = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: thisMonthStart, $lt: thisMonthEnd }, doctorId }),
      Appointment.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }, doctorId }),
    ]);

    return {
      statusCode: 200,
      data: {
        invoices: { thisMonth: thisMonthInvoices, lastMonth: lastMonthInvoices },
        prescriptions: { thisMonth: thisMonthPrescriptions, lastMonth: lastMonthPrescriptions },
        doctorPatients: { thisMonth: thisMonthDoctorPatients, lastMonth: lastMonthDoctorPatients },
        appointments: { thisMonth: thisMonthAppointments, lastMonth: lastMonthAppointments },
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const getDashboardKPIs = async (doctorId) => {
  try {
    // Total Patients
    const totalPatients = await DoctorPatient.countDocuments({ doctorId });
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(thisMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(thisMonthStart);
    // Patients this month and last month
    const patientsThisMonth = await DoctorPatient.countDocuments({ doctorId, createdAt: { $gte: thisMonthStart } });
    const patientsLastMonth = await DoctorPatient.countDocuments({ doctorId, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } });
    const patientChange = patientsThisMonth - patientsLastMonth;
    const patientPercentChange = patientsLastMonth === 0 ? 0 : ((patientChange) / patientsLastMonth) * 100;

    // Appointments this month and last month
    const appointmentsThisMonth = await Appointment.countDocuments({ doctorId, createdAt: { $gte: thisMonthStart } });
    const appointmentsLastMonth = await Appointment.countDocuments({ doctorId, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } });
    const appointmentChange = appointmentsThisMonth - appointmentsLastMonth;
    const appointmentPercentChange = appointmentsLastMonth === 0 ? 0 : ((appointmentChange) / appointmentsLastMonth) * 100;

    // Messages this month and last month
    const messagesThisMonth = await Message.countDocuments({ doctorId, createdAt: { $gte: thisMonthStart } });
    const messagesLastMonth = await Message.countDocuments({ doctorId, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } });
    const messageChange = messagesThisMonth - messagesLastMonth;
    const messagePercentChange = messagesLastMonth === 0 ? 0 : ((messageChange) / messagesLastMonth) * 100;

    const kpis = [
      {
        label: 'Total Patients',
        value: totalPatients,
        change: (patientPercentChange >= 0 ? '+' : '') + patientPercentChange.toFixed(2) + '%',
        changeType: patientPercentChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Appointments',
        value: appointmentsThisMonth,
        change: (appointmentPercentChange >= 0 ? '+' : '') + appointmentPercentChange.toFixed(2) + '%',
        changeType: appointmentPercentChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Messages',
        value: messagesThisMonth,
        change: (messagePercentChange >= 0 ? '+' : '') + messagePercentChange.toFixed(2) + '%',
        changeType: messagePercentChange >= 0 ? 'positive' : 'negative',
      },
    ];
    return { statusCode: 200, kpis };
  } catch (error) {
    return { statusCode: 500, error: error.message };
  }
};

const getDateRange = (monthOffset = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
  return { start, end };
};

const getPatient12MonthsReport = async (doctorId) => {
  try {
    const now = new Date();
    const past12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const patients = await DoctorPatient.find({
      doctorId,
      createdAt: { $gte: past12Months }
    }).sort({ createdAt: 1 });
    const monthlyReport = new Array(12).fill(0);
    patients.forEach(patient => {
      const patientDate = new Date(patient.createdAt);
      const yearDifference = patientDate.getFullYear() - past12Months.getFullYear();
      const monthDifference = patientDate.getMonth() - past12Months.getMonth();
      const monthIndex = yearDifference * 12 + monthDifference;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyReport[monthIndex]++;
      }
    });
    return {
      statusCode: 200,
      patients: monthlyReport,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getAppointmentTypeReport = async (doctorId) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const appointments = await Appointment.find({
      doctorId,
      createdAt: { $gte: lastMonth }
    });
    const typeCounts = {};
    appointments.forEach(appt => {
      const type = appt.type || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const result = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    return {
      statusCode: 200,
      types: result,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getTodayAppointmentsPaginated = async (doctorId, page = 1, limit = 7) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const query = {
      doctorId,
      date: { $gte: todayStart, $lt: todayEnd },
    };
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ time: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('patientId');
    return {
      statusCode: 200,
      appointments,
      pagination: { total, page, limit },
    };
  } catch (error) {
    return { statusCode: 500, error: error.message };
  }
};

const getPlannedSurgeriesPaginated = async (doctorId, page = 1, limit = 7) => {
  try {
    const now = new Date();
    const query = {
      doctorId,
      type: 'Surgery',
      // Optionally filter by date if needed
    };
    const total = await Prescription.countDocuments(query);
    const surgeries = await Prescription.find(query)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return {
      statusCode: 200,
      surgeries,
      pagination: { total, page, limit },
    };
  } catch (error) {
    return { statusCode: 500, error: error.message };
  }
};

module.exports = {
  getPatient24HourReport,
  getPatient30DaysReport,
  getInvoice12MonthsReport,
  getPayment12MonthsReport,
  getComparisonData,
};

module.exports.getDashboardKPIs = getDashboardKPIs;
module.exports.getPatient12MonthsReport = getPatient12MonthsReport;
module.exports.getAppointmentTypeReport = getAppointmentTypeReport;
module.exports.getTodayAppointmentsPaginated = getTodayAppointmentsPaginated;
module.exports.getPlannedSurgeriesPaginated = getPlannedSurgeriesPaginated;
