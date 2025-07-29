const mongoose = require('mongoose');

const doctorPatientSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  },
);

const DoctorPatient = mongoose.model('DoctorPatient', doctorPatientSchema);
module.exports = DoctorPatient;
