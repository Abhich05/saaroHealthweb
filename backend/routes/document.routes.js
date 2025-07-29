const express = require('express');
const documentController = require('../controllers/document.controller');
const documentLibrary = express.Router({ mergeParams: true });

documentLibrary.post('/', documentController.upload.single('document'), documentController.addDocument);
documentLibrary.get('/', documentController.getAllDocumentsByDoctorId);
documentLibrary.put('/:documentId', documentController.upload.single('document'), documentController.updateDocument);
documentLibrary.delete('/:documentId', documentController.deleteDocument);

module.exports = documentLibrary; 