const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    introduction: {
      required: true,
      type: String,
    },
    happyClients: {
      required: true,
      type: Number,
    },
    experience: {
      required: true,
      type: Number,
    },
    about: {
      required: true,
      type: String,
    },
    locations: [
      {
        name: {
          required: true,
          type: String,
        },
        address: {
          required: true,
          type: String,
        },
        days: [
          {
            required: true,
            type: String,
          },
        ],
        from: {
          required: true,
          type: String,
        },
        to: {
          required: true,
          type: String,
        },
        timeslot: {
          required: true,
          type: Number,
        },
      },
    ],
    unavailabilityDate: {
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
    },
    availabilityAfter: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
module.exports = DoctorProfile;
