console.log("ROUTES FILE LOADED - UNIQUE456");
const express = require('express');
const fileUploaderUtil = require('../utils/fileUploader');
const fileUploaderController = require('../controllers/fileUploader.controller');
const doctorMiddleware = require('../middlewares/doctor.middleware');

const fileUploader = express.Router();

fileUploader.get('/ipd-all', fileUploaderController.getAllIpdRecords);

fileUploader.post(
  '/upload',
  fileUploaderController.uploadFile,
);

fileUploader.post('/upload/:patientId', fileUploaderController.uploadFile);

// Lightweight any-auth middleware (doctor or user) for avatar upload only
const anyAuth = async (req, res, next) => {
  try {
    // Accept Bearer token, doctor cookie jwt_token, or user cookie user_jwt_token
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
    const doctorCookie = req.cookies?.jwt_token || null;
    const userCookie = req.cookies?.user_jwt_token || null;
    if (!(bearer || doctorCookie || userCookie)) {
      return res.status(401).json({ error: 'Access token required' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Very small in-memory rate limiter for avatar endpoint only
const avatarRateStore = new Map(); // key: ip, value: { count, ts }
const rateLimitAvatar = (req, res, next) => {
  const windowMs = 60 * 1000; // 1 minute
  const max = 20; // 20 uploads/min per IP
  const now = Date.now();
  const key = req.ip || req.connection?.remoteAddress || 'unknown';
  const entry = avatarRateStore.get(key) || { count: 0, ts: now };
  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  avatarRateStore.set(key, entry);
  if (entry.count > max) {
    return res.status(429).json({ error: 'Too many upload requests. Please try again later.' });
  }
  next();
};

// Avatar upload route (protected + rate limited)
fileUploader.post('/avatar', anyAuth, rateLimitAvatar, fileUploaderController.uploadAvatar);

// Branding upload routes (protected)
fileUploader.post('/branding/logo', doctorMiddleware, fileUploaderController.uploadBrandingLogo);
fileUploader.post('/branding/letterhead', doctorMiddleware, fileUploaderController.uploadBrandingLetterhead);
fileUploader.post('/branding/signature', doctorMiddleware, fileUploaderController.uploadBrandingSignature);

fileUploader.get(
  '/:type',
  fileUploaderController.getFilesByPatientId
)

fileUploader.get('/ipd', fileUploaderController.getFilesByPatientId);

fileUploader.patch('/ipd/:ipdId', fileUploaderController.updateIpdRecord);

module.exports = fileUploader;
