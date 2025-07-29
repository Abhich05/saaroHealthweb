const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const dashboard = express.Router({ mergeParams: true });

dashboard.get(
  '/patient/24hours',
  dashboardController.getPatient24HourReport,
);

dashboard.get(
  '/patient/30days',
  dashboardController.getPatient30DaysReport,
);

dashboard.get(
  '/patient/12months',
  dashboardController.getPatient12MonthsReport,
);

dashboard.get(
  '/appointment/types',
  dashboardController.getAppointmentTypeReport,
);

dashboard.get(
  '/invoice/12months',
  dashboardController.getInvoice12MonthsReport,
);

dashboard.get(
  '/payment/12months',
  dashboardController.getPayment12MonthsReport,
);

dashboard.get(
  '/comparison',
  dashboardController.getComparisonData,
);

dashboard.get(
  '/today-appointments',
  dashboardController.getTodayAppointmentsPaginated,
);

dashboard.get(
  '/planned-surgeries',
  dashboardController.getPlannedSurgeriesPaginated,
);

dashboard.get('/kpis/:doctorId', dashboardController.dashboardKPIs);

module.exports = dashboard;
