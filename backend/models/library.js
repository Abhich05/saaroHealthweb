const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fields: [{
      type: String,
      required: true,
    }],
  },
  {
    timestamps: true,
  },
);

const Library = mongoose.model('Library', librarySchema);
module.exports = Library;
