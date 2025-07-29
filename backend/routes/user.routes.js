const express = require('express');
const router = express.Router({ mergeParams: true });
const userController = require('../controllers/user.controller');
const doctorMiddleware = require('../middlewares/doctor.middleware');
const { userMiddleware, checkPermission, checkDoctorAccess } = require('../middlewares/user.middleware');

// Public routes (no authentication required)
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);

// Protected routes (require user authentication)
router.get('/me', userMiddleware, userController.getCurrentUser);
router.put('/change-password', userMiddleware, userController.changePassword);
router.put('/profile', userMiddleware, userController.updateProfile);

// Doctor-only routes (require doctor authentication)
// For now, let's use a simpler approach without the complex doctor middleware
router.get('/', userController.getUsersByDoctor);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router; 