const { verifyAccessToken } = require('../utils/helpers');
const User = require('../models/user');

const userMiddleware = async (req, res, next) => {
  try {
    // Try to get token from Authorization header or cookie
    let accessToken = null;
    if (req.headers.authorization) {
      accessToken = req.headers.authorization.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.user_jwt_token) {
      accessToken = req.cookies.user_jwt_token;
    }

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: 'Access token required' });
    }

    const userDetails = await verifyAccessToken(accessToken);
    if (userDetails?.error) {
      return res
        .status(403)
        .json({ error: userDetails.error });
    }

    // Verify user exists and is active
    const user = await User.findById(userDetails.data._id);
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found' });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      doctorId: user.doctorId
    };

    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message });
  }
};

// Middleware to check specific permissions
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    
    if (!userPermissions || userPermissions[requiredPermission] === 'none') {
      return res.status(403).json({ 
        error: `Access denied. Required permission: ${requiredPermission}` 
      });
    }
    
    next();
  };
};

// Middleware to check if user has access to specific doctor's data
const checkDoctorAccess = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    
    if (req.user.doctorId.toString() !== doctorId) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access data from your assigned doctor.' 
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  userMiddleware,
  checkPermission,
  checkDoctorAccess
}; 