const Document = require('../models/document');

const addDocument = async (doctorId, documentDetails) => {
  try {
    const document = new Document({
      doctorId,
      name: documentDetails.name,
      patientName: documentDetails.patientName,
      type: documentDetails.type,
      fileName: documentDetails.fileName,
      fileUrl: documentDetails.fileUrl,
      fileSize: documentDetails.fileSize,
      mimeType: documentDetails.mimeType
    });

    await document.save();

    return {
      statusCode: 201,
      document: document
    };
  } catch (error) {
    console.error('Error in addDocument service:', error);
    return {
      statusCode: 500,
      error: error.message
    };
  }
};

const getAllDocumentsByDoctorId = async (doctorId) => {
  try {
    const documents = await Document.find({ doctorId }).sort({ createdAt: -1 });

    return {
      statusCode: 200,
      documents: documents
    };
  } catch (error) {
    console.error('Error in getAllDocumentsByDoctorId service:', error);
    return {
      statusCode: 500,
      error: error.message
    };
  }
};

const updateDocument = async (documentId, documentDetails) => {
  try {
    const updateData = {
      name: documentDetails.name,
      patientName: documentDetails.patientName,
      type: documentDetails.type
    };

    // Add file details if a new file is uploaded
    if (documentDetails.fileName) {
      updateData.fileName = documentDetails.fileName;
      updateData.fileUrl = documentDetails.fileUrl;
      updateData.fileSize = documentDetails.fileSize;
      updateData.mimeType = documentDetails.mimeType;
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      updateData,
      { new: true }
    );

    if (!document) {
      return {
        statusCode: 404,
        error: 'Document not found'
      };
    }

    return {
      statusCode: 200,
      document: document
    };
  } catch (error) {
    console.error('Error in updateDocument service:', error);
    return {
      statusCode: 500,
      error: error.message
    };
  }
};

const deleteDocument = async (documentId) => {
  try {
    const document = await Document.findByIdAndDelete(documentId);

    if (!document) {
      return {
        statusCode: 404,
        error: 'Document not found'
      };
    }

    return {
      statusCode: 200,
      message: 'Document deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteDocument service:', error);
    return {
      statusCode: 500,
      error: error.message
    };
  }
};

module.exports = {
  addDocument,
  getAllDocumentsByDoctorId,
  updateDocument,
  deleteDocument
}; 