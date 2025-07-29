const documentService = require('../services/document.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'public/documents/';
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `document_${uniqueSuffix}${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const addDocument = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, patientName, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentDetails = {
      name,
      patientName,
      type,
      fileName: file.filename,
      fileUrl: `${process.env.SERVER_URL || 'https://saarohealthweb-1.onrender.com'}/public/documents/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    };

    const document = await documentService.addDocument(doctorId, documentDetails);
    
    if (document?.error) {
      return res.status(document.statusCode).json({ error: document.error });
    }

    res.status(document.statusCode).json({ document: document.document });
  } catch (error) {
    console.error('Error in addDocument:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllDocumentsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const documents = await documentService.getAllDocumentsByDoctorId(doctorId);

    res.status(documents.statusCode).json({ documents: documents.documents });
  } catch (error) {
    console.error('Error in getAllDocumentsByDoctorId:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { name, patientName, type } = req.body;
    const file = req.file;

    const documentDetails = {
      name,
      patientName,
      type
    };

    // If a new file is uploaded, add file details
    if (file) {
      documentDetails.fileName = file.filename;
      documentDetails.fileUrl = `${process.env.SERVER_URL || 'https://saarohealthweb-1.onrender.com'}/public/documents/${file.filename}`;
      documentDetails.fileSize = file.size;
      documentDetails.mimeType = file.mimetype;
    }

    const document = await documentService.updateDocument(documentId, documentDetails);
    
    if (document?.error) {
      return res.status(document.statusCode).json({ error: document.error });
    }

    res.status(document.statusCode).json({ document: document.document });
  } catch (error) {
    console.error('Error in updateDocument:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await documentService.deleteDocument(documentId);
    
    if (result?.error) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addDocument,
  getAllDocumentsByDoctorId,
  updateDocument,
  deleteDocument,
  upload
}; 