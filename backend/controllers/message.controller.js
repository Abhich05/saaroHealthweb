const messageService = require('../services/message.service');

const sendMessage = async (req, res) => {
  try {
    const { doctorId, patientId, sender, content } = req.body;
    const result = await messageService.sendMessage({ doctorId, patientId, sender, content });
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.status(201).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getMessages = async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;
    const result = await messageService.getMessages({ doctorId, patientId });
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    // Always return an array, even if empty
    res.status(200).json({ messages: result.messages || [] });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { sendMessage, getMessages }; 