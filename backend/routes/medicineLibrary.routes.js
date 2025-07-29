const express = require('express');
const medicineController = require('../controllers/medicineLibrary.controller');
const medicineLibrary = express.Router({ mergeParams: true });

medicineLibrary.post('/', medicineController.addMedicine);
medicineLibrary.get('/', medicineController.getAllMedicinesByDoctorId);
medicineLibrary.delete('/:medicineId', medicineController.deleteMedicine);

module.exports = medicineLibrary;
