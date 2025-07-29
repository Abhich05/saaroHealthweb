const mongoose = require('mongoose');

const {
  MONGO_URL,
  DB_NAME,
} = require('../config/config');

const dbConnection = () => {
  mongoose.connect(MONGO_URL, { dbName: DB_NAME })
    .then(() => console.log('Connected with MongoDB'))
    .catch((error) => console.error('An error occurred: ', error));
}

module.exports = dbConnection;
