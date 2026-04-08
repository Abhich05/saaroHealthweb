const mongoose = require('mongoose');

const {
  MONGO_URL,
  DB_NAME,
} = require('../config/config');

const dbConnection = () => {
  return mongoose.connect(MONGO_URL, { dbName: DB_NAME })
    .then(() => {
      console.log('Connected with MongoDB');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1); // stop server if DB fails
    });
};

module.exports = dbConnection;
