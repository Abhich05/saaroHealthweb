console.log("ROUTES FILE LOADED - UNIQUE456");
const express = require('express');
const fileUploaderUtil = require('../utils/fileUploader');
const fileUploaderController = require('../controllers/fileUploader.controller');

const fileUploader = express.Router();

fileUploader.get('/ipd-all', fileUploaderController.getAllIpdRecords);

fileUploader.post(
  '/upload',
  fileUploaderController.uploadFile,
);

fileUploader.post('/upload/:patientId', fileUploaderController.uploadFile);

// Avatar upload route
fileUploader.post('/avatar', fileUploaderController.uploadAvatar);

fileUploader.get(
  '/:type',
  fileUploaderController.getFilesByPatientId
)

fileUploader.get('/ipd', fileUploaderController.getFilesByPatientId);

fileUploader.patch('/ipd/:ipdId', fileUploaderController.updateIpdRecord);

module.exports = fileUploader;
