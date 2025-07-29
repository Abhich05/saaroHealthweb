const express = require('express');
const templateController = require('../controllers/templateLibrary.controller');
const templateLibrary = express.Router({ mergeParams: true });

templateLibrary.post('/', templateController.addTemplate);
templateLibrary.get('/', templateController.getAllTemplatesByDoctorId);
templateLibrary.put('/:templateId', templateController.updateTemplate);
templateLibrary.delete('/:templateId', templateController.deleteTemplate);

module.exports = templateLibrary;
