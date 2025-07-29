const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    patientId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    location: {
      required: true,
      type: String,
    },
    date: {
      required: true,
      type: Date,
    },
    time: {
      required: true,
      type: String,
    },
    type: {
      required: true,
      type: String,
    },
    markComplete: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  },
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
