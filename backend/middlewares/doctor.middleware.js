const { verifyAccessToken } = require('../utils/helpers');
const Doctor = require('../models/doctor');

const doctorMiddleware = async (req, res, next) => {
  try {
    // Debug logging
    console.log('=== DOCTOR MIDDLEWARE DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    
    // Try to get token from Authorization header or cookie
    let accessToken = null;
    if (req.headers.authorization) {
      accessToken = req.headers.authorization.replace('Bearer ', '');
      console.log('Token from Authorization header:', accessToken ? 'Present' : 'Missing');
    } else if (req.cookies && req.cookies.jwt_token) {
      accessToken = req.cookies.jwt_token;
      console.log('Token from cookie:', accessToken ? 'Present' : 'Missing');
    } else {
      console.log('No token found in headers or cookies');
    }
    
    const { doctorId } = req.params;
    console.log('Doctor ID from params:', doctorId);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ error: 'Doctor not found' });
    }

    const doctorDetails = await verifyAccessToken(accessToken);
    if (doctorDetails?.error) {
      return res
        .status(403)
        .json({ error: doctorDetails.error });
    }

    if (doctorDetails.data._id != doctorId) {
      return res
        .status(401)
        .json({ error: 'Unauthorized access' });
    }

    // Set doctor info in request object
    req.doctor = {
      id: doctorId,
      email: doctor.email,
      name: doctor.name
    };

    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: err });
  }
}

module.exports = doctorMiddleware;
