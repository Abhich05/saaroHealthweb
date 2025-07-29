const express = require('express');
const libraryController = require('../controllers/library.controller');
const library = express.Router({ mergeParams: true });

library.post('/', libraryController.addLibrary);
library.get('/', libraryController.getAllLibrary);
library.post('/dropdown', libraryController.addDropdown);
library.get('/dropdown', libraryController.getAllDropdowns);
library.get('/:doctorId', libraryController.getSurgery);

module.exports = library;
