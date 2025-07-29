const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validateUser } = require('../validations/userValidation');
const { getAccessToken, verifyAccessToken } = require('../utils/helpers');

const getUsersByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Basic authentication check - verify token exists
    let accessToken = null;
    if (req.headers.authorization) {
      accessToken = req.headers.authorization.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.jwt_token) {
      accessToken = req.cookies.jwt_token;
    }
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const users = await User.find({ doctorId });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, email, password, role, permissions, avatar, phone } = req.body;
    
    console.log('=== CREATE USER DEBUG ===');
    console.log('Creating user with:', { name, email, role, password: password ? '***' : 'undefined' });
    console.log('Doctor ID from params:', doctorId);
    console.log('Request headers:', req.headers);
    console.log('Request cookies:', req.cookies);
    
    // Basic authentication check - verify token exists
    let accessToken = null;
    if (req.headers.authorization) {
      accessToken = req.headers.authorization.replace('Bearer ', '');
      console.log('Token from Authorization header:', accessToken ? 'Present' : 'Missing');
    } else if (req.cookies && req.cookies.jwt_token) {
      accessToken = req.cookies.jwt_token;
      console.log('Token from jwt_token cookie:', accessToken ? 'Present' : 'Missing');
    } else if (req.cookies && req.cookies.user_jwt_token) {
      accessToken = req.cookies.user_jwt_token;
      console.log('Token from user_jwt_token cookie:', accessToken ? 'Present' : 'Missing');
    }
    
    if (!accessToken) {
      console.log('No access token found');
      return res.status(401).json({ error: 'Access token required' });
    }
    
    console.log('Access token found, proceeding with user creation');
    
    const validation = validateUser({ name, email, password, confirmPassword: password });
    
    if (validation && validation.error) {
      return res.status(400).json({ error: validation.error });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully for user:', name);
    
    const user = new User({ name, email, password: hashedPassword, role, permissions, avatar, phone, doctorId });
    await user.save();
    
    console.log('User created successfully:', user._id);
    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key error for phone field
    if (error.code === 11000 && error.message.includes('phone')) {
      return res.status(400).json({ 
        error: 'Database schema issue: Please contact administrator to fix phone field index' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, role, permissions, avatar, phone } = req.body;
    
    console.log('updateUser called with:', { userId, name, email, role, permissions });
    
    // Basic authentication check - verify token exists
    let accessToken = null;
    if (req.headers.authorization) {
      accessToken = req.headers.authorization.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.jwt_token) {
      accessToken = req.cookies.jwt_token;
    }
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const update = { name, email, role, permissions, avatar, phone };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    
    console.log('Updating user with data:', update);
    
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    
    if (!user) {
      console.log('User not found for update');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', user._id);
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Basic authentication check - verify token exists
    let accessToken = null;
    if (req.headers.authorization) {
      accessToken = req.headers.authorization.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.jwt_token) {
      accessToken = req.cookies.jwt_token;
    }
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    await User.findByIdAndDelete(userId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User authentication methods
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('doctorId', 'name clinicName');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Checking password for user:', user.name);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.name);
      return res.status(401).json({ error: 'Invalid password' });
    }

    const accessToken = getAccessToken(user);
    console.log('Generated access token for user:', user.name);

    res
      .cookie('user_jwt_token', accessToken, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
      })
      .status(200)
      .json({ 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          doctorId: user.doctorId._id,
          doctorName: user.doctorId.name,
          clinicName: user.doctorId.clinicName
        }
      });
      
    console.log('Login successful for user:', user.name);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res
      .clearCookie('user_jwt_token', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
      .status(200)
      .json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('doctorId', 'name clinicName');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        doctorId: user.doctorId._id,
        doctorName: user.doctorId.name,
        clinicName: user.doctorId.clinicName,
        avatar: user.avatar,
        mobile: user.mobile,
        experience: user.experience,
        specialization: user.specialization,
        education: user.education,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log('Password change request for user:', userId);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Get user with current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      console.log('Invalid current password for user:', user.name);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    console.log('Password changed successfully for user:', user.name);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, mobile, experience, specialization, education, bio, avatar } = req.body;

    console.log('=== USER PROFILE UPDATE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);
    console.log('Update data:', { name, email, mobile, experience, specialization, education, bio, avatar });

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', user.name);

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (experience !== undefined) user.experience = experience;
    if (specialization) user.specialization = specialization;
    if (education) user.education = education;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    console.log('Updated user object:', {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      experience: user.experience,
      specialization: user.specialization,
      education: user.education,
      bio: user.bio,
      avatar: user.avatar
    });

    await user.save();

    console.log('Profile updated successfully for user:', user.name);
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        experience: user.experience,
        specialization: user.specialization,
        education: user.education,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('=== USER PROFILE UPDATE ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsersByDoctor,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  updateProfile
}; 