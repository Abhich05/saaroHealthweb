const invoiceService = require('../services/invoice.service');
const { fileUploader, uploadPatientRecords } = require('../utils/fileUploader');
const FileUploader = require('../models/fileUploader');
const Prescription = require('../models/prescription');
const multer = require('multer');
const path = require('path');

const uploadFile = async (req, res) => {
  fileUploader(req, res);
  // uploadPatientRecords(req, res);
}

const uploadAvatar = async (req, res) => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const folder = 'public/avatars/';
        // Create directory if it doesn't exist
        const fs = require('fs');
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const fileExtension = path.extname(file.originalname);
        cb(null, `avatar_${uniqueSuffix}${fileExtension}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed.'), false);
      }
    };

    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }).single('avatar');

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: `Error: ${err.message}` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      // Build absolute URL based on current request (supports proxies/CDNs)
      const proto = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${proto}://${host}`;
      const avatarUrl = `${baseUrl}/public/avatars/${req.file.filename}`;
      
      return res.status(200).json({
        message: 'Avatar uploaded successfully.',
        avatarUrl: avatarUrl,
        filename: req.file.filename
      });
    });
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    res.status(500).json({
      message: `An error occurred: ${error.message}`,
    });
  }
};

const getFilesByPatientId = async (req, res) => {
  try {
    // Support both route param and query param for patientId
    const patientId = req.params.patientId || req.query.patientId;
    const type = req.params.type || req.query.type || 'ipd';

    let data = {};
    if (
      type === 'health'
      || type === 'ipd'
    ) {
      data = await FileUploader.find({
        patientId,
        type,
      }).sort({ updatedAt: -1 });
    } else if (type === 'prescription') {
      data = await Prescription.find({
        patientId,
      }).sort({ updatedAt: -1 });
    }

    res
      .status(200)
      .json({
        files: data,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updateIpdRecord = async (req, res) => {
  try {
    const { ipdId } = req.params;
    const { admissionDate, dischargeDate, status } = req.body;
    const update = {};
    if (admissionDate) update.admissionDate = admissionDate;
    if (dischargeDate) update.dischargeDate = dischargeDate;
    if (status) update.status = status;
    const updated = await FileUploader.findByIdAndUpdate(ipdId, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'IPD record not found' });
    res.json({ file: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllIpdRecords = async (req, res) => {
  try {
    const { doctorId, page = 1, limit = 7, searchQuery = "" } = req.query;
    const result = await FileUploader.getPaginatedIpdRecords({ doctorId, page, limit, searchQuery });
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.status(200).json({ files: result.files, pagination: result.pagination });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

module.exports = {
  uploadFile,
  getFilesByPatientId,
  updateIpdRecord,
  getAllIpdRecords,
  uploadAvatar,
};
