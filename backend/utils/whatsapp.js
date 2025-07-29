const doubletick = require('@api/doubletick');

const {
  DOUBLE_TICK_API_KEY,
} = require('../config/config');

const sendTemplateMessage = async(
  phoneNumber,
  content,
) => {
  try {
    doubletick.auth(DOUBLE_TICK_API_KEY);
    // const response = await doubletick.outgoingMessagesWhatsappTemplate({
    //       messages: [
    //         {
    //           content: content,
    //           to: `+91${phoneNumber}`,
    //         }
    //       ]
    //     });

    // console.log('Response: ', response?.data?.messages);
  } catch (error) {
    console.log('Error Response: ', error?.response?.data);
    return {
      statusCode: 500,
      error: error,
    };
  }
}

module.exports = {
  sendTemplateMessage,
};
