const express = require('express');
const prescriptionSectionController = require('../controllers/prescriptionSection.controller');
const prescriptionSection = express.Router({ mergeParams: true });

prescriptionSection.post('/', prescriptionSectionController.addPrescriptionSection);
prescriptionSection.get('/', prescriptionSectionController.getAllPrescriptionSectionByDoctorId);
prescriptionSection.patch('/:prescriptionId', prescriptionSectionController.updatePrescriptionSection);
prescriptionSection.delete('/:prescriptionId', prescriptionSectionController.deletePrescriptionSection);

module.exports = prescriptionSection;
