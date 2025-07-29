const express = require('express');
const messageController = require('../controllers/message.controller');

const router = express.Router();

// Send a message
router.post('/', messageController.sendMessage);

// Get messages between a doctor and a patient
router.get('/', messageController.getMessages);

module.exports = router; 