const express = require('express');
const router = express.Router();
const { upload, healthCheck, processAudio, savePrescription } = require('../controllers/voicerx.controller');

// Health check endpoint
router.get('/health', healthCheck);

// Process audio file and generate prescription
router.post('/transcribe-parse', upload.single('audio'), processAudio);

// Save prescription to database
router.post('/save-prescription', savePrescription);

module.exports = router;
