const mongoose = require('mongoose');

const templateLibrarySchema = new mongoose.Schema(
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
    data: [{
      type: Object,
      required: true,
    }],
  },
  {
    timestamps: true,
  },
);

const TemplateLibrary = mongoose.model('TemplateLibrary', templateLibrarySchema);
module.exports = TemplateLibrary;
