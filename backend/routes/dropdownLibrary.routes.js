const express = require('express');
const dropdownController = require('../controllers/dropdownLibrary.controller');
const dropdownLibrary = express.Router({ mergeParams: true });

dropdownLibrary.post('/', dropdownController.addDropdown);
dropdownLibrary.get('/', dropdownController.getAllDropdownsByDoctorId);
dropdownLibrary.put('/:dropdownId', dropdownController.updateDropdown);
dropdownLibrary.delete('/:dropdownId', dropdownController.deleteDropdown);

module.exports = dropdownLibrary;
