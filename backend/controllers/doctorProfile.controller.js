const doctorProfileService = require('../services/doctorProfile.service');

const createDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const profileData = req.body;

    const doctorProfile = await doctorProfileService.createDoctorProfile(doctorId, profileData);
    if (doctorProfile?.error) {
      return res
        .status(doctorProfile.statusCode)
        .send(doctorProfile.error);
    }

    res
      .status(doctorProfile.statusCode)
      .json({ doctorProfile: doctorProfile.doctorProfile });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctorProfile = await doctorProfileService.getDoctorProfile(doctorId);
    if (doctorProfile?.error) {
      return res
        .status(doctorProfile.statusCode)
        .send(doctorProfile.error);
    }

    res
      .status(doctorProfile.statusCode)
      .json({ doctorProfile: doctorProfile.doctorProfile });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAppointmentDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctorProfile = await doctorProfileService.getAppointmentDetails(doctorId);
    if (doctorProfile?.error) {
      return res
        .status(doctorProfile.statusCode)
        .send(doctorProfile.error);
    }

    res
      .status(doctorProfile.statusCode)
      .json({ doctorProfile: doctorProfile.doctorProfile });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  createDoctorProfile,
  getDoctorProfile,
  getAppointmentDetails,
};
