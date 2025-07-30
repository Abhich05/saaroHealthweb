import React, { useState, useEffect, useContext } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";
import Modal from '../components/ui/GenericModal';
import Pagination from "../components/ui/Pagination";
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";

const columns = [
  { label: "Medicine Name", accessor: "name" },
  { label: "Composition", accessor: "composition" },
  { label: "Frequency", accessor: "frequency" },
  { label: "Dosage", accessor: "dosage" },
  { label: "Notes", accessor: "notes" },
  { label: "Created By", accessor: "createdBy" },
  { label: "Actions", accessor: "actions" },
];

const Medicines = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicinesList, setMedicinesList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    composition: "",
    frequency: "",
    dosage: "",
    notes: "",
    createdBy: "",
  });

  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doctorId = useContext(DoctorIdContext);

  // Fetch medicines
  const fetchMedicines = async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(`/${doctorId}/medicine`);
      setMedicinesList(Array.isArray(res.data.medicines) ? res.data.medicines : []);
    } catch (err) {
      setMedicinesList([]);
      setError("Failed to fetch medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [doctorId]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Medicine name is required";
    }
    if (!formData.composition.trim()) {
      newErrors.composition = "Composition is required";
    }
    if (!formData.frequency.trim()) {
      newErrors.frequency = "Frequency is required";
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveMedicine = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      if (editIndex !== null) {
        // Update existing medicine
        const medicineId = medicinesList[editIndex]._id;
        await axiosInstance.put(`/${doctorId}/medicine/${medicineId}`, formData);
      } else {
        // Create new medicine
        await axiosInstance.post(`/${doctorId}/medicine`, formData);
      }

      // Refresh the medicines list
      await fetchMedicines();

      // Reset form
      setFormData({
        name: "",
        composition: "",
        frequency: "",
        dosage: "",
        notes: "",
        createdBy: "",
      });
      setErrors({});
      setEditIndex(null);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const medicine = filteredMedicines[index];
    setFormData({
      name: medicine.name || "",
      composition: medicine.composition || "",
      frequency: medicine.frequency || "",
      dosage: medicine.dosage || "",
      notes: medicine.notes || "",
      createdBy: medicine.createdBy || "",
    });
    setEditIndex(index);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError("");
      const medicineId = medicinesList[deleteIndex]._id;
      await axiosInstance.delete(`/${doctorId}/medicine/${medicineId}`);
      
      // Refresh the medicines list
      await fetchMedicines();
      
      setDeleteIndex(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      name: "",
      composition: "",
      frequency: "",
      dosage: "",
      notes: "",
      createdBy: "",
    });
    setEditIndex(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const filteredMedicines = medicinesList.filter((medicine) =>
    medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.composition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / pageSize);
  const paginatedData = filteredMedicines.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Remove full page loading

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
                <h1 className="text-3xl font-bold text-gray-900">Medicine Library</h1>
                <p className="text-gray-600 mt-1">Manage your medicine database for quick prescription access</p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FiPlus size={20} />
                Add Medicine
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
                placeholder="Search medicines by name or composition..."
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
                data={paginatedData.map((medicine, index) => ({
                  ...medicine,
                  actions: (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                        title="Edit Medicine"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteIndex((currentPage - 1) * pageSize + index);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"
                        title="Delete Medicine"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ),
                }))}
                loading={loading}
                loadingRows={8}
                renderCell={(row, accessor) => {
                  if (accessor === "actions") {
                    return row[accessor];
                  }
                  if (accessor === "notes" && row[accessor] && row[accessor].length > 50) {
                    return (
                      <span className="text-sm text-gray-600" title={row[accessor]}>
                        {row[accessor].substring(0, 50)}...
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
              
              {paginatedData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FiSearch size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first medicine"}
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
          onClose={() => setIsModalOpen(false)}
          title={editIndex !== null ? "Edit Medicine" : "Add New Medicine"}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol 500mg"
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
                  Composition *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol 500mg, Caffeine 65mg"
                  value={formData.composition}
                  onChange={(e) => handleInputChange("composition", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.composition ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.composition && (
                  <p className="text-red-500 text-sm mt-1">{errors.composition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Twice daily, SOS"
                  value={formData.frequency}
                  onChange={(e) => handleInputChange("frequency", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.frequency ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.frequency && (
                  <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1 tablet, 5ml"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange("dosage", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.dosage ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dosage && (
                  <p className="text-red-500 text-sm mt-1">{errors.dosage}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes, side effects, contraindications..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.createdBy}
                  onChange={(e) => handleInputChange("createdBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMedicine}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editIndex !== null ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this medicine? This action cannot be undone.
            </p>
            {deleteIndex !== null && medicinesList[deleteIndex] && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{medicinesList[deleteIndex].name}</p>
                <p className="text-sm text-gray-600">{medicinesList[deleteIndex].composition}</p>
              </div>
            )}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Medicines;