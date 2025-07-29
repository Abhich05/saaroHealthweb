const Message = require('../models/message');

const sendMessage = async ({ doctorId, patientId, sender, content }) => {
  try {
    const message = new Message({ doctorId, patientId, sender, content });
    await message.save();
    return { statusCode: 201, message };
  } catch (error) {
    return { statusCode: 500, error };
  }
};

const getMessages = async ({ doctorId, patientId }) => {
  try {
    const messages = await Message.find({ doctorId, patientId }).sort({ timestamp: 1 });
    return { statusCode: 200, messages };
  } catch (error) {
    return { statusCode: 500, error };
  }
};

module.exports = { sendMessage, getMessages }; 