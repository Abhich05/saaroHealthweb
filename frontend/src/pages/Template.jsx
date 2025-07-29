import React, { useState, useEffect, useContext } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import Button from '../components/ui/Button';
import Modal from '../components/ui/GenericModal';
import Pagination from "../components/ui/Pagination";
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';
import Loading from '../components/ui/Loading';

const columns = [
  { label: "Template Name", accessor: "name" },
  { label: "Section Type", accessor: "type" },
  { label: "Content", accessor: "items" },
  { label: "Created By", accessor: "creator" },
  { label: "Actions", accessor: "actions" },
];

const TEMPLATE_SECTIONS = [
  { value: "History", label: "Patient History" },
  { value: "Advice", label: "Medical Advice" },
  { value: "Complaints", label: "Patient Complaints" },
  { value: "Medications", label: "Medications" },
  { value: "Investigation Advice", label: "Investigation Advice" },
  { value: "Physical Examination", label: "Physical Examination" },
  { value: "Diagnosis", label: "Diagnosis" },
  { value: "Follow Up", label: "Follow Up Instructions" },
];

const Templates = () => {
  const [templateData, setTemplateData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    type: '', 
    items: '', 
    creator: '' 
  });
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [smallLoading, setSmallLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const doctorId = useContext(DoctorIdContext);

  // Helper to fetch templates
  const fetchTemplates = async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(`/${doctorId}/template`);
      setTemplateData(Array.isArray(res.data.templates) ? res.data.templates : []);
    } catch (err) {
      setTemplateData([]);
      setError("Failed to fetch templates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [doctorId]);

  const handleCreateTemplate = () => {
    setFormData({ name: '', type: '', items: '', creator: '' });
    setEditIndex(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    if (!formData.type.trim()) {
      newErrors.type = "Section type is required";
    }
    if (!formData.items.trim()) {
      newErrors.items = "Template content is required";
    }
    if (!formData.creator.trim()) {
      newErrors.creator = "Creator name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSmallLoading(true);
      setError("");
      
      if (editIndex !== null && templateData[editIndex]?._id) {
        // Edit existing template
        await axiosInstance.put(
          `/${doctorId}/template/${templateData[editIndex]._id}`,
          formData
        );
      } else {
        // Create new template
        await axiosInstance.post(
          `/${doctorId}/template`,
          formData
        );
      }
      
      await fetchTemplates();
      setFormData({ name: '', type: '', items: '', creator: '' });
      setEditIndex(null);
      setErrors({});
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save template');
    } finally {
      setSmallLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({ name: '', type: '', items: '', creator: '' });
    setEditIndex(null);
    setErrors({});
  };

  const handleEdit = (index) => {
    const template = filteredTemplates[index];
    setFormData({
      name: template.name || '',
      type: template.type || '',
      items: template.items || '',
      creator: template.creator || '',
    });
    setEditIndex(index);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (index) => {
    const template = filteredTemplates[index];
    if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      try {
        setSmallLoading(true);
        setError("");
        
        if (template && template._id) {
          await axiosInstance.delete(`/${doctorId}/template/${template._id}`);
          await fetchTemplates();
        }
      } catch (err) {
        setError('Failed to delete template');
      } finally {
        setSmallLoading(false);
      }
    }
  };

  const filteredTemplates = templateData.filter((template) =>
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.items?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const paginatedData = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <Loading />;
  
  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
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
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Template Library</h1>
                <p className="text-gray-600 mt-1">Create and manage prescription templates for quick access</p>
              </div>
              <Button
                onClick={handleCreateTemplate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FiPlus size={20} />
                Create Template
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search templates by name, type, or content..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <GenericTable
                columns={columns}
                data={paginatedData.map((template, index) => ({
                  ...template,
                  actions: (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                        title="Edit Template"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"
                        title="Delete Template"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ),
                }))}
                renderCell={(row, accessor) => {
                  if (accessor === "actions") {
                    return row[accessor];
                  }
                  if (accessor === "items" && row[accessor] && row[accessor].length > 80) {
                    return (
                      <span className="text-sm text-gray-600" title={row[accessor]}>
                        {row[accessor].substring(0, 80)}...
                      </span>
                    );
                  }
                  return (
                    <span className="text-sm text-gray-900">
                      {row[accessor] || "-"}
                    </span>
                  );
                }}
              />
              
              {paginatedData.length === 0 && !smallLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FiFileText size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first template"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </main>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={editIndex !== null ? "Edit Template" : "Create New Template"}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Common Cold Advice"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Section Type</option>
                  {TEMPLATE_SECTIONS.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Content *
                </label>
                <textarea
                  placeholder="Enter your template content here. You can use placeholders like [PATIENT_NAME], [DIAGNOSIS], etc."
                  value={formData.items}
                  onChange={(e) => handleInputChange("items", e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.items ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.items && (
                  <p className="text-red-500 text-sm mt-1">{errors.items}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use placeholders like [PATIENT_NAME], [DIAGNOSIS], [MEDICATION] for dynamic content
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.creator}
                  onChange={(e) => handleInputChange("creator", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.creator ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.creator && (
                  <p className="text-red-500 text-sm mt-1">{errors.creator}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={smallLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
              >
                {smallLoading ? 'Saving...' : (editIndex !== null ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Templates;