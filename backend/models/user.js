const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['doctor', 'receptionist', 'billingStaff', 'admin', 'custom'], default: 'custom' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    permissions: { type: Object, default: {} },
    avatar: { type: String, default: '' },
    mobile: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    specialization: { type: String, default: '' },
    education: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema); 