import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import axiosInstance from '../api/axiosInstance';
import dropdownService from '../api/dropdownService';
import Button from "../components/ui/Button";
import Modal from '../components/ui/GenericModal'; 
import Pagination from "../components/ui/Pagination"; 
import Loading from "../components/ui/Loading";
import { DoctorIdContext } from '../App';

const columns = [
  { label: "Entry Name", accessor: "name" },
  { label: "Section", accessor: "sectionName" },
  { label: "Created By", accessor: "creator" },
  { label: "Actions", accessor: "action" },
];

const sectionOptions = [
  { id: "surgery_advised", name: "Surgery Advised" },
  { id: "any_implant", name: "Any Implant" },
  { id: "antiplatelet", name: "Antiplatelet" },
  { id: "recent_investigation", name: "Recent Investigation" },
  { id: "complaints", name: "Complaints" },
  { id: "investigation_advice", name: "Investigation Advice" },
  { id: "advice", name: "Advice" },
  { id: "previous_surgery", name: "Previous Surgery" },
];

const DropDownConfiguration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    sectionId: "", 
    sectionName: "", 
    creator: "" 
  });
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

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
    fetchDropdowns();
  }, [doctorId]);

  const fetchDropdowns = async () => {
    setLoading(true);
    setError("");
    try {
      const dropdowns = await dropdownService.getAllDropdowns(doctorId);
      setData(dropdowns);
    } catch (err) {
      setData([]);
      setError("Failed to fetch dropdown data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
    
    // Auto-fill sectionName when sectionId changes
    if (field === "sectionId") {
      const selectedSection = sectionOptions.find(opt => opt.id === value);
      setFormData(prev => ({ 
        ...prev, 
        sectionId: value, 
        sectionName: selectedSection ? selectedSection.name : "" 
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.sectionId) {
      newErrors.sectionId = "Section is required.";
    }
    if (!formData.creator.trim()) {
      newErrors.creator = "Creator is required.";
    }
    return newErrors;
  };

  const handleAddOrEdit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        sectionId: formData.sectionId,
        sectionName: formData.sectionName,
        creator: formData.creator.trim()
      };

      if (editingId) {
        // Update existing dropdown
        await dropdownService.updateDropdown(doctorId, editingId, payload);
      } else {
        // Add new dropdown
        await dropdownService.addDropdown(doctorId, payload);
      }

      // Refresh data
      await fetchDropdowns();
      
      // Reset form
      setFormData({ name: "", sectionId: "", sectionName: "", creator: "" });
      setErrors({});
      setEditIndex(null);
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to save dropdown entry.";
      setErrors({ submit: errorMessage });
    }
  };

  const handleEdit = (index) => {
    const item = data[index];
    setFormData({
      name: item.name || "",
      sectionId: item.sectionId || "",
      sectionName: item.sectionName || "",
      creator: item.creator || "System"
    });
    setEditIndex(index);
    setEditingId(item._id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const itemToDelete = data[deleteIndex];
      await dropdownService.deleteDropdown(doctorId, itemToDelete._id);
      
      // Refresh data
      await fetchDropdowns();
      
      setDeleteIndex(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to delete dropdown entry.";
      setError(errorMessage);
    }
  };

  // Remove full page loading
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
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl leading-10 font-semibold">Dropdown Configuration</h2>
              <Button
                onClick={() => {
                  setFormData({ name: "", sectionId: "", sectionName: "", creator: "" });
                  setEditIndex(null);
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
                className="bg-[#7042D9] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#8f6de1]"
              >
                + Add New Entry
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl">
              <GenericTable
                columns={columns}
                data={paginatedData.map((item, index) => ({
                  ...item,
                  action: (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit((currentPage - 1) * pageSize + index)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteIndex((currentPage - 1) * pageSize + index);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                }))}
                loading={loading}
                loadingRows={8}
                renderCell={(row, accessor) => row[accessor]}
              />
              {paginatedData.length === 0 && (
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

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Entry" : "Add New Entry"}
        >
          <div className="grid grid-cols-1 gap-4">
            {errors.submit && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Name *
              </label>
              <input
                placeholder="Enter dropdown entry name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                value={formData.sectionId}
                onChange={(e) => handleInputChange("sectionId", e.target.value)}
                className="border px-3 py-2 rounded w-full appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Section</option>
                {sectionOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-8 transform -translate-y-1/2 text-gray-500">
                ▼
              </div>
              {errors.sectionId && <p className="text-red-500 text-xs mt-1">{errors.sectionId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creator *
              </label>
              <input
                placeholder="Enter creator name"
                value={formData.creator}
                onChange={(e) => handleInputChange("creator", e.target.value)}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.creator && <p className="text-red-500 text-xs mt-1">{errors.creator}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddOrEdit}
              className="px-4 py-2 bg-[#5e3bea] text-white rounded-md hover:bg-[#4c2fd9] transition"
            >
              {editingId ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </Modal>

        

        {/* Delete Confirm Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this entry?</p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropDownConfiguration;

{/*{isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">
                {editIndex !== null ? "Edit Entry" : "Add New Entry"}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => handleInputChange("sectionId", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  {errors.sectionId && <p className="text-red-500 text-xs mt-1">{errors.sectionId}</p>}
                </div>

                <div>
                  <input
                    placeholder="Creator"
                    value={formData.creator}
                    onChange={(e) => handleInputChange("creator", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                  {errors.creator && (
                    <p className="text-red-500 text-xs mt-1">{errors.creator}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrEdit}
                  className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                >
                  {editIndex !== null ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </div>
          </div>
        )}*/}