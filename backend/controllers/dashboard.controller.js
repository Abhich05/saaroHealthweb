const dashboardService = require('../services/dashboard.service');
const { getDashboardKPIs } = require('../services/dashboard.service');

const getPatient24HourReport = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const patients = await dashboardService.getPatient24HourReport(doctorId);
    if (patients?.error) {
      return res
        .status(patients.statusCode)
        .send(patients.error);
    }

    res
      .status(patients.statusCode)
      .json({ patients: patients.patients });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPatient30DaysReport = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const patients = await dashboardService.getPatient30DaysReport(doctorId);
    if (patients?.error) {
      return res
        .status(patients.statusCode)
        .send(patients.error);
    }

    res
      .status(patients.statusCode)
      .json({ patients: patients.patients });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getInvoice12MonthsReport = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const invoices = await dashboardService.getInvoice12MonthsReport(doctorId);
    if (invoices?.error) {
      return res
        .status(invoices.statusCode)
        .send(invoices.error);
    }

    res
      .status(invoices.statusCode)
      .json({ invoices: invoices.invoices });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPayment12MonthsReport = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const payments = await dashboardService.getPayment12MonthsReport(doctorId);
    if (payments?.error) {
      return res
        .status(payments.statusCode)
        .send(payments.error);
    }

    res
      .status(payments.statusCode)
      .json({ payments: payments.payments });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getComparisonData = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const comparisonData = await dashboardService.getComparisonData(doctorId);
    if (comparisonData?.error) {
      return res
        .status(comparisonData.statusCode)
        .send(comparisonData.error);
    }

    res
      .status(comparisonData.statusCode)
      .json({ comparisonData: comparisonData.data });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPatient12MonthsReport = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patients = await dashboardService.getPatient12MonthsReport(doctorId);
    if (patients?.error) {
      return res.status(patients.statusCode).send(patients.error);
    }
    res.status(patients.statusCode).json({ patients: patients.patients });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const getAppointmentTypeReport = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const types = await dashboardService.getAppointmentTypeReport(doctorId);
    if (types?.error) {
      return res.status(types.statusCode).send(types.error);
    }
    res.status(types.statusCode).json({ types: types.types });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const getTodayAppointmentsPaginated = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 7 } = req.query;
    const result = await dashboardService.getTodayAppointmentsPaginated(doctorId, parseInt(page), parseInt(limit));
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.status(200).json({ appointments: result.appointments, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlannedSurgeriesPaginated = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 7 } = req.query;
    const result = await dashboardService.getPlannedSurgeriesPaginated(doctorId, parseInt(page), parseInt(limit));
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.status(200).json({ surgeries: result.surgeries, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const dashboardKPIs = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await getDashboardKPIs(doctorId);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.status(200).json({ kpis: result.kpis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPatient24HourReport,
  getPatient30DaysReport,
  getInvoice12MonthsReport,
  getPayment12MonthsReport,
  getComparisonData,
  getPatient12MonthsReport,
  getAppointmentTypeReport,
  getTodayAppointmentsPaginated,
  getPlannedSurgeriesPaginated,
};
module.exports.dashboardKPIs = dashboardKPIs;
module.exports.getPatient12MonthsReport = getPatient12MonthsReport;
module.exports.getAppointmentTypeReport = getAppointmentTypeReport;
module.exports.getTodayAppointmentsPaginated = getTodayAppointmentsPaginated;
module.exports.getPlannedSurgeriesPaginated = getPlannedSurgeriesPaginated;
