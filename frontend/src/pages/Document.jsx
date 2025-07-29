import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";
import Modal from '../components/ui/GenericModal';
import Pagination from "../components/ui/Pagination";
import Loading from "../components/ui/Loading";
import { DoctorIdContext } from '../App';
import { FiUpload, FiDownload, FiPrinter, FiEye } from "react-icons/fi";

const columns = [
  { label: "Document Name", accessor: "name" },
  { label: "Patient Name", accessor: "patientName" },
  { label: "Document Type", accessor: "type" },
  { label: "Upload Date", accessor: "createdAt" },
  { label: "Actions", accessor: "actions" },
];

const documentTypes = [
  "Medical Report",
  "Lab Report",
  "X-Ray",
  "Prescription",
  "Discharge Summary",
  "Surgery Report",
  "Other"
];

const Document = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    patientName: "", 
    type: "", 
    file: null 
  });
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doctorId = useContext(DoctorIdContext);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/${doctorId}/documents`)
      .then(res => {
        setData(Array.isArray(res.data.documents) ? res.data.documents : []);
      })
      .catch((err) => {
        console.error('Error fetching documents:', err);
        setData([]);
        if (err.response?.status === 500) {
          setError("Document service is not available. Please contact administrator or try again later.");
        } else {
          setError("Failed to fetch documents. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      setErrors({ ...errors, file: "" });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Document name is required.";
    if (!formData.patientName.trim()) newErrors.patientName = "Patient name is required.";
    if (!formData.type) newErrors.type = "Document type is required.";
    if (!formData.file && !editIndex) newErrors.file = "Please select a file.";
    return newErrors;
  };

  const handleAddOrEdit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('patientName', formData.patientName);
      formDataToSend.append('type', formData.type);
      if (formData.file) {
        formDataToSend.append('document', formData.file);
      }

      if (editIndex !== null) {
        // Update existing document
        const documentId = data[editIndex]._id;
        await axiosInstance.put(`/${doctorId}/documents/${documentId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Add new document
        await axiosInstance.post(`/${doctorId}/documents`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Refresh data
      const res = await axiosInstance.get(`/${doctorId}/documents`);
      setData(Array.isArray(res.data.documents) ? res.data.documents : []);
      
      setIsModalOpen(false);
      setFormData({ name: "", patientName: "", type: "", file: null });
      setEditIndex(null);
      setErrors({});
    } catch (error) {
      console.error('Error saving document:', error);
      setErrors({ general: "Failed to save document. Please try again." });
    }
  };

  const handleEdit = (index) => {
    const document = data[index];
    setFormData({
      name: document.name,
      patientName: document.patientName,
      type: document.type,
      file: null
    });
    setEditIndex(index);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const documentId = data[deleteIndex]._id;
      await axiosInstance.delete(`/${doctorId}/documents/${documentId}`);
      
      const updatedData = data.filter((_, index) => index !== deleteIndex);
      setData(updatedData);
      setIsDeleteModalOpen(false);
      setDeleteIndex(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setErrors({ general: "Failed to delete document. Please try again." });
    }
  };

  const handleView = (document) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  const handlePrint = (document) => {
    try {
      // For PDF files, open in new window for printing
      if (document.mimeType === 'application/pdf') {
        window.open(document.fileUrl, '_blank');
      } else {
        // For other file types, create a print-friendly page
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Document - ${document.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin-bottom: 20px; }
                .info p { margin: 5px 0; }
                .document-link { margin-top: 20px; text-align: center; }
                .document-link a { color: blue; text-decoration: underline; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Document: ${document.name}</h1>
              </div>
              <div class="info">
                <p><strong>Patient Name:</strong> ${document.patientName}</p>
                <p><strong>Document Type:</strong> ${document.type}</p>
                <p><strong>Upload Date:</strong> ${new Date(document.createdAt).toLocaleDateString()}</p>
                <p><strong>File Size:</strong> ${(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div class="document-link">
                <p><strong>Document URL:</strong></p>
                <a href="${document.fileUrl}" target="_blank">${document.fileUrl}</a>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error printing document:', error);
      alert('Error printing document. Please try downloading and printing manually.');
    }
  };

  const handleDownload = (document) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.name;
      link.target = '_blank';
      
      // Add file extension if missing
      if (!document.name.includes('.')) {
        const extension = document.mimeType === 'application/pdf' ? '.pdf' : 
                         document.mimeType.startsWith('image/') ? '.jpg' : '.doc';
        link.download = document.name + extension;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      // Fallback: open in new tab
      window.open(document.fileUrl, '_blank');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({ name: "", patientName: "", type: "", file: null });
    setEditIndex(null);
    setErrors({});
  };

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-red-100 text-red-700 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-semibold text-gray-900">Patient Documents</h1>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                + Upload Document
              </Button>
            </div>

            <GenericTable
              data={paginatedData}
              columns={columns}
              renderCell={(row, accessor) => {
                if (accessor === "createdAt") {
                  return new Date(row.createdAt).toLocaleDateString();
                }
                if (accessor === "actions") {
                  return (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(row)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(row)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Download"
                      >
                        <FiDownload size={16} />
                      </button>
                      <button
                        onClick={() => handlePrint(row)}
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="Print"
                      >
                        <FiPrinter size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(paginatedData.indexOf(row))}
                        className="p-1 text-orange-600 hover:text-orange-800"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          setDeleteIndex(paginatedData.indexOf(row));
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                }
                // Return the default value for other columns
                return row[accessor] || '';
              }}
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={editIndex !== null ? "Edit Document" : "Upload Document"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter document name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.patientName ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter patient name"
            />
            {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.type ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className={`w-full p-2 border rounded-md ${errors.file ? "border-red-500" : "border-gray-300"}`}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
            {editIndex !== null && (
              <p className="text-gray-500 text-sm mt-1">
                Leave empty to keep the existing file
              </p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm">{errors.general}</p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrEdit}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {editIndex !== null ? "Update" : "Upload"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Document"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this document?</p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Document Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Document"
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Document Name:</strong> {selectedDocument.name}
              </div>
              <div>
                <strong>Patient Name:</strong> {selectedDocument.patientName}
              </div>
              <div>
                <strong>Document Type:</strong> {selectedDocument.type}
              </div>
              <div>
                <strong>Upload Date:</strong> {new Date(selectedDocument.createdAt).toLocaleDateString()}
              </div>
              <div>
                <strong>File Size:</strong> {(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div>
                <strong>File Type:</strong> {selectedDocument.mimeType}
              </div>
            </div>

            {/* Document Preview */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Document Preview:</h3>
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] max-h-[500px] overflow-auto">
                {selectedDocument.mimeType === 'application/pdf' ? (
                  <iframe
                    src={selectedDocument.fileUrl}
                    width="100%"
                    height="400"
                    title="Document Preview"
                    className="border-0"
                  />
                ) : selectedDocument.mimeType.startsWith('image/') ? (
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.name}
                    className="max-w-full h-auto mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Preview not available for this file type ({selectedDocument.mimeType})
                    </p>
                    <p className="text-sm text-gray-500">
                      Please download the file to view its contents.
                    </p>
                  </div>
                )}
                <div className="text-center py-8" style={{ display: 'none' }}>
                  <p className="text-red-600 mb-4">Failed to load document preview</p>
                  <p className="text-sm text-gray-500">
                    The document may be corrupted or the URL is invalid.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => handleDownload(selectedDocument)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download
              </Button>
              <Button
                onClick={() => handlePrint(selectedDocument)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Print
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Document; 