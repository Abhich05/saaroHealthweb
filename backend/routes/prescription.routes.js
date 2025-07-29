const express = require('express');
const prescription = express.Router({ mergeParams: true });
const prescriptionController = require('../controllers/prescription.controller');

prescription.post('/', prescriptionController.createPrescription);
prescription.post('/end-consultation', prescriptionController.endConsultationOfPrescription);
prescription.get('/', prescriptionController.getPrescriptionsByPatientId);
prescription.get('/draft', prescriptionController.getDraftPrescriptionOfPatient);

module.exports = prescription;
