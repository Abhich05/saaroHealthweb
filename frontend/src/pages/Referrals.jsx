import React, { useState, useEffect, useContext } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/GenericModal";
import Pagination from "../components/ui/Pagination";
import { DoctorIdContext } from "../App";
import axiosInstance from "../api/axiosInstance";

const columns = [
  { label: "Name", accessor: "name" },
  { label: "Contact Number", accessor: "contactNumber" },
  { label: "Specialization", accessor: "specialization" },
  { label: "Address", accessor: "address" },
  { label: "Actions", accessor: "actions" },
];

const Referrals = () => {
  const doctorId = useContext(DoctorIdContext);
  const [referrals, setReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    specialization: "",
    address: "",
    email: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  // Fetch referrals
  const fetchReferrals = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/${doctorId}/referrals?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(searchTerm)}`);
      const referralsData = Array.isArray(res.data.referrals) ? res.data.referrals : [];
      setReferrals(referralsData);
      setTotalPages(Math.max(1, Math.ceil((res.data.pagination?.total || referralsData.length) / pageSize)));
    } catch (err) {
      setReferrals([]);
      setError("Failed to fetch referrals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [doctorId, currentPage, searchTerm]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (editIndex !== null) {
        // Update existing referral
        await axiosInstance.put(`/${doctorId}/referrals/${referrals[editIndex]._id}`, formData);
      } else {
        // Add new referral
        await axiosInstance.post(`/${doctorId}/referrals`, formData);
      }
      
      handleCloseModal();
      fetchReferrals();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save referral");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditIndex(null);
    setFormData({
      name: "",
      contactNumber: "",
      specialization: "",
      address: "",
      email: "",
      notes: ""
    });
    setErrors({});
  };

  const handleEdit = (index) => {
    const referral = referrals[index];
    setFormData({
      name: referral.name || "",
      contactNumber: referral.contactNumber || "",
      specialization: referral.specialization || "",
      address: referral.address || "",
      email: referral.email || "",
      notes: referral.notes || ""
    });
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteIndex === null) return;
    
    setLoading(true);
    try {
      await axiosInstance.delete(`/${doctorId}/referrals/${referrals[deleteIndex]._id}`);
      setIsDeleteModalOpen(false);
      setDeleteIndex(null);
      fetchReferrals();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete referral");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditIndex(null);
    setFormData({
      name: "",
      contactNumber: "",
      specialization: "",
      address: "",
      email: "",
      notes: ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const filteredReferrals = referrals.filter((referral) =>
    referral.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.contactNumber?.includes(searchTerm) ||
    referral.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
                <p className="text-gray-600 mt-1">Manage your referral contacts for patient referrals</p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FiPlus size={20} />
                Add Referral
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
                placeholder="Search referrals by name, contact, or specialization..."
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
                data={filteredReferrals.map((referral, index) => ({
                  ...referral,
                  actions: (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                        title="Edit Referral"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteIndex(index);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"
                        title="Delete Referral"
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
                  if (accessor === "address" && row[accessor] && row[accessor].length > 50) {
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
              
              {filteredReferrals.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FiSearch size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first referral contact"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editIndex !== null ? "Edit Referral" : "Add New Referral"}
        >
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    placeholder="Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`border px-3 py-2 rounded w-full ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input
                    placeholder="Contact Number *"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    className={`border px-3 py-2 rounded w-full ${errors.contactNumber ? "border-red-500" : ""}`}
                  />
                  {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    placeholder="Specialization *"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    className={`border px-3 py-2 rounded w-full ${errors.specialization ? "border-red-500" : ""}`}
                  />
                  {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
                </div>
                <div>
                  <input
                    placeholder="Email (Optional)"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Address</h3>
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="border px-3 py-2 rounded w-full"
                rows={3}
              />
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Additional Notes</h3>
              <textarea
                placeholder="Additional notes (Optional)"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="border px-3 py-2 rounded w-full"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : (editIndex !== null ? "Update" : "Save")}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Referral"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this referral? This action cannot be undone.
            </p>
            {deleteIndex !== null && referrals[deleteIndex] && (
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {referrals[deleteIndex].name}</p>
                <p><strong>Contact:</strong> {referrals[deleteIndex].contactNumber}</p>
                <p><strong>Specialization:</strong> {referrals[deleteIndex].specialization}</p>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Referrals; 