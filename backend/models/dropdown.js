const mongoose = require('mongoose');

const dropdownSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Dropdown = mongoose.model('Dropdown', dropdownSchema);
module.exports = Dropdown;
