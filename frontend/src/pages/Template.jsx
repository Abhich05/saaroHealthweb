import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import Button from '../components/ui/Button';
import Modal from '../components/ui/GenericModal'
import Pagination from "../components/ui/Pagination"; // ✅ imported
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';
import Loading from '../components/ui/Loading';

const columns = [
  { label: "Template Name", accessor: "name" },
  { label: "Type", accessor: "type" },
  { label: "Items", accessor: "items" },
  { label: "Created By", accessor: "creator" },
  { label: "Actions", accessor: "actions" },
];

const Templates = () => {
  const [templateData, setTemplateData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', items: '', creator: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [smallLoading, setSmallLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(templateData.length / pageSize);

  const paginatedData = templateData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const doctorId = useContext(DoctorIdContext);

  // Helper to fetch templates
  const fetchTemplates = () => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/${doctorId}/template`)
      .then(res => {
        setTemplateData(Array.isArray(res.data.templates) ? res.data.templates : []);
        setLoading(false);
      })
      .catch(() => {
        setTemplateData([]);
        setLoading(false);
        setError("Failed to fetch templates. Please try again.");
      });
  };

  useEffect(() => {
    if (doctorId) {
      fetchTemplates();
    } else {
      // Fallback: if doctorId is missing for 2 seconds, stop loading
      const timeout = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [doctorId]);

  if (loading && doctorId !== undefined && doctorId !== null) return <Loading />;
  if (!doctorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#7042D9] via-[#a78bfa] to-white">
        <h2 className="text-2xl font-semibold text-[#7042D9] mb-2">Doctor not found</h2>
        <p className="text-gray-600">Please log in again or contact support.</p>
      </div>
    );
  }

  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-red-100 text-red-700 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  const handleCreateTemplate = () => {
    setFormData({ name: '', type: '', items: '', creator: '' });
    setEditIndex(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Template name is required.";
    if (!formData.type.trim()) newErrors.type = "Type is required.";
    if (!formData.items.trim()) newErrors.items = "Items are required.";
    if (!formData.creator.trim()) newErrors.creator = "Creator is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
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
        fetchTemplates();
        setFormData({ name: '', type: '', items: '', creator: '' });
        setEditIndex(null);
        setErrors({});
        setIsModalOpen(false);
      } catch (err) {
        setErrors({ api: err.response?.data?.error || 'Failed to save template' });
        setError(err.response?.data?.error || 'Failed to save template');
      } finally {
        setSmallLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({ name: '', type: '', items: '', creator: '' });
    setEditIndex(null);
    setErrors({});
  };

  const handleEdit = (index) => {
    setFormData(templateData[index]);
    setEditIndex(index);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        setSmallLoading(true);
        setError("");
        const template = templateData[index];
        if (template && template._id) {
          await axiosInstance.delete(`/${doctorId}/template/${template._id}`);
          fetchTemplates();
        }
      } catch (err) {
        setError('Failed to delete template');
        alert('Failed to delete template');
      } finally {
        setSmallLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl leading-10 font-semibold">Templates</h2>
              <Button
                onClick={handleCreateTemplate}
                className="bg-[#7042D9] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#e0dbf6]"
              >
                + Create Template
              </Button>
            </div>

            {smallLoading && (
              <div className="flex justify-center items-center mb-4">
                <Loading />
              </div>
            )}

            <div className="overflow-x-auto rounded-xl">
              <GenericTable
                columns={columns}
                data={paginatedData.map((item, index) => ({
                  ...item,
                  actions: (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit((currentPage - 1) * pageSize + index)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete((currentPage - 1) * pageSize + index)}
                        className="text-red-500 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                }))}
                renderCell={(row, accessor) => (
                  <span className={accessor === "actions" ? "" : "text-md"}>
                    {row[accessor]}
                  </span>
                )}
              />
              {paginatedData.length === 0 && !smallLoading && (
                <div className="text-center text-gray-500 py-8">Data Not Found</div>
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </main>
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={editIndex !== null ? "Edit Template" : "Create Template"}
        >
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Template Name"
                className="w-full border rounded px-3 py-2"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 appearance-none"
              >
                <option value="">Select Section</option>
                <option value="History">History</option>
                <option value="Advice">Advice</option>
                <option value="Complaints">Complaints</option>
                <option value="Medications">Medications</option>
                <option value="Investigation Advice">Investigation Advice</option>
                <option value="Physical Examination">Physical Examination</option>
                <option value="Diagnosis">Diagnosis</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ▼
              </div>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            <div>
              <textarea
                name="items"
                value={formData.items}
                onChange={handleInputChange}
                placeholder="Items"
                className="w-full border rounded px-3 py-2"
              />
              {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
            </div>

            <div>
              <input
                type="text"
                name="creator"
                value={formData.creator}
                onChange={handleInputChange}
                placeholder="Created By"
                className="w-full border rounded px-3 py-2"
              />
              {errors.creator && <p className="text-red-500 text-sm mt-1">{errors.creator}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              onClick={handleCancel}
              className="text-white font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="text-blue-600 font-semibold"
              disabled={smallLoading}
            >
              {smallLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Templates;