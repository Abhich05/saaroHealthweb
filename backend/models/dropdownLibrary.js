const mongoose = require('mongoose');

const dropdownLibrarySchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    sectionId: {
      type: String,
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    name: {
      index: true,
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const DropdownLibrary = mongoose.model('DropdownLibrary', dropdownLibrarySchema);
module.exports = DropdownLibrary;
