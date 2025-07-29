const doctorService = require('../services/doctor.service');
const Doctor = require('../models/doctor');

const registerDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    const doctor = await doctorService.registerDoctor(doctorData);
    if (doctor?.error) {
      return res
        .status(doctor.statusCode)
        .send(doctor.error);
    }

    res
      .status(doctor.statusCode)
      .json({ doctor: doctor.doctor });
  } catch(error) {
    console.error('Error in registerDoctor:', error); // Added for debugging
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const loginDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    const doctor = await doctorService.loginDoctor(doctorData);
    if (doctor?.error) {
      return res
        .status(doctor.statusCode)
        .send(doctor.error);
    }

    // Set JWT as httpOnly cookie
    res
      .cookie('jwt_token', doctor.doctor.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
      })
      .status(doctor.statusCode)
      .json({ doctorId: doctor.doctor.id });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await doctorService.getDoctor(doctorId);
    if (doctor?.error) {
      return res
        .status(doctor.statusCode)
        .send(doctor.error);
    }

    res
      .status(doctor.statusCode)
      .json({ doctor: doctor.doctor });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await doctorService.deleteDoctor(doctorId);
    if (doctor?.error) {
      return res
        .status(doctor.statusCode)
        .send(doctor.error);
    }

    res
      .status(doctor.statusCode)
      .json({ message: 'Doctor deleted successfully' });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getFirstDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne();
    if (!doctor) return res.status(404).json({ error: 'No doctor found' });
    res.status(200).json({ doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const doctorId = req.doctor.id;

    console.log('Password change request for doctor:', doctorId);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Get doctor with current password
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, doctor.password);
    if (!isCurrentPasswordValid) {
      console.log('Invalid current password for doctor:', doctor.name);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    doctor.password = hashedNewPassword;
    await doctor.save();

    console.log('Password changed successfully for doctor:', doctor.name);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { name, email, mobile, experience, specialization, education, bio, avatar } = req.body;

    console.log('=== DOCTOR PROFILE UPDATE DEBUG ===');
    console.log('Doctor ID:', doctorId);
    console.log('Request body:', req.body);
    console.log('Update data:', { name, email, mobile, experience, specialization, education, bio });

    // Get doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found for ID:', doctorId);
      return res.status(404).json({ error: 'Doctor not found' });
    }

    console.log('Found doctor:', doctor.name);

    // Update fields
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (mobile) doctor.mobile = mobile;
    if (experience !== undefined) doctor.experience = experience;
    if (specialization) doctor.specialization = specialization;
    if (education) doctor.education = education;
    if (bio) doctor.bio = bio;
    if (avatar) doctor.avatar = avatar;

    console.log('Updated doctor object:', {
      name: doctor.name,
      email: doctor.email,
      mobile: doctor.mobile,
      experience: doctor.experience,
      specialization: doctor.specialization,
      education: doctor.education,
      bio: doctor.bio
    });

    await doctor.save();

    console.log('Profile updated successfully for doctor:', doctor.name);
    res.status(200).json({ 
      message: 'Profile updated successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        mobile: doctor.mobile,
        experience: doctor.experience,
        specialization: doctor.specialization,
        education: doctor.education,
        bio: doctor.bio,
        avatar: doctor.avatar,
        clinicName: doctor.clinicName
      }
    });
  } catch (error) {
    console.error('=== DOCTOR PROFILE UPDATE ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerDoctor,
  loginDoctor,
  getDoctor,
  deleteDoctor,
  getFirstDoctor,
  changePassword,
  updateProfile
};
