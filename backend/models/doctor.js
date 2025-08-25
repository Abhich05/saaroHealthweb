const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    rmcNumber: {
      index: true,
      required: true,
      type: String,
      unique: true,
    },
    phoneNumber: {
      index: true,
      required: true,
      type: String,
    },
    email: {
      index: true,
      required: true,
      type: String,
      unique: true,
    },
    address: {
      required: true,
      type: String,
    },
    clinicName: {
      type: String,
      default: null,
    },
    password: {
      required: true,
      type: String,
    },
    mobile: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    specialization: { type: String, default: '' },
    education: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    // Branding assets for Templates & Branding tab
    brandingLogo: { type: String, default: '' },
    brandingLetterhead: { type: String, default: '' },
    brandingSignature: { type: String, default: '' },
    // Branding theme
    brandingColors: {
      primary: { type: String, default: '#5e3bea' },
      secondary: { type: String, default: '#7c69a7' },
      neutral: { type: String, default: '#120F1A' },
    },
    brandingFont: {
      family: { type: String, default: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"' },
      size: { type: Number, default: 14 },
    },
    opdLocations: [
      {
        clinicName: { type: String, default: '' },
        city: { type: String, default: '' },
        address: { type: String, default: '' },
        days: {
          Mon: { type: Boolean, default: false },
          Tue: { type: Boolean, default: false },
          Wed: { type: Boolean, default: false },
          Thu: { type: Boolean, default: false },
          Fri: { type: Boolean, default: false },
          Sat: { type: Boolean, default: false },
          Sun: { type: Boolean, default: false },
        },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        slotMins: { type: Number, default: 10 },
        active: { type: Boolean, default: true },
        mapLocation: {
          lat: { type: Number, default: null },
          lng: { type: Number, default: null },
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
