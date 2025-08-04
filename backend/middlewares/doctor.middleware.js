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
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the token and get doctor details
    const doctorDetails = await verifyAccessToken(accessToken);
    if (doctorDetails?.error) {
      console.log('Token verification failed:', doctorDetails.error);
      return res
        .status(403)
        .json({ error: doctorDetails.error });
    }

    // Get doctor ID from token payload
    const doctorId = doctorDetails.data._id;
    console.log('Doctor ID from token:', doctorId);

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found for ID:', doctorId);
      return res
        .status(404)
        .json({ error: 'Doctor not found' });
    }

    // Set doctor info in request object
    req.doctor = {
      id: doctorId,
      email: doctor.email,
      name: doctor.name
    };

    console.log('Doctor middleware successful for:', doctor.name);
    next();
  } catch (err) {
    console.error('Doctor middleware error:', err);
    res
      .status(500)
      .json({ error: err.message });
  }
}

module.exports = doctorMiddleware;
