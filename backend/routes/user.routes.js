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
router.get('/', doctorMiddleware, userController.getUsersByDoctor);
router.post('/', doctorMiddleware, userController.createUser);
router.put('/:userId', doctorMiddleware, userController.updateUser);
router.delete('/:userId', doctorMiddleware, userController.deleteUser);

module.exports = router; 