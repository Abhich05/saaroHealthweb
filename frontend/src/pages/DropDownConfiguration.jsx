import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";
import Modal from '../components/ui/GenericModal'; // adjust the path as needed
import Pagination from "../components/ui/Pagination"; // ✅ Import Pagination
import Loading from "../components/ui/Loading";
import { DoctorIdContext } from '../App';

const columns = [
  { label: "Entry Name", accessor: "name" },
  { label: "Section", accessor: "section" },
  { label: "Created By", accessor: "creator" },
  { label: "Actions", accessor: "action" },
];

const sectionOptions = [
  "Surgery Advised",
  "Any Implant",
  "Antiplatelet",
  "Recent Investigation",
  "Complaints",
  "Investigation Advice",
  "Advice",
  "Previous Surgery",
];

const DropDownConfiguration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ name: "", section: "", creator: "" });
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

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
    axiosInstance.get(`/doctor/${doctorId}/dropdown`)
      .then(res => {
        setData(Array.isArray(res.data.dropdowns) ? res.data.dropdowns : []);
      })
      .catch(() => {
        setData([]);
        setError("Failed to fetch dropdown data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "This field is required.";
      }
    });
    return newErrors;
  };

  const handleAddOrEdit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newEntry = { ...formData };

    if (editIndex !== null) {
      const updated = [...data];
      updated[editIndex] = newEntry;
      setData(updated);
    } else {
      const newList = [newEntry, ...data];
      setData(newList);

      const newTotalPages = Math.ceil(newList.length / pageSize);
      setCurrentPage(newTotalPages);
    }

    setFormData({ name: "", section: "", creator: "" });
    setErrors({});
    setEditIndex(null);
    setIsModalOpen(false);
  };

  const handleEdit = (index) => {
    setFormData(data[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    const updated = [...data];
    updated.splice(deleteIndex, 1);
    setData(updated);
    setDeleteIndex(null);
    setIsDeleteModalOpen(false);
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
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl leading-10 font-semibold">Dropdown Configuration</h2>
              <Button
                onClick={() => {
                  setFormData({ name: "", section: "", creator: "" });
                  setEditIndex(null);
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
  title={editIndex !== null ? "Edit Entry" : "Add New Entry"}
>
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

    <div className="relative">
  <select
    value={formData.section}
    onChange={(e) => handleInputChange("section", e.target.value)}
    className="border px-3 py-2 rounded w-full appearance-none"
  >
    <option value="">Select Section</option>
    {sectionOptions.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
    ▼
  </div>
  {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
</div>


    <div>
      <input
        placeholder="Creator"
        value={formData.creator}
        onChange={(e) => handleInputChange("creator", e.target.value)}
        className="border px-3 py-2 rounded w-full"
      />
      {errors.creator && <p className="text-red-500 text-xs mt-1">{errors.creator}</p>}
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
                    value={formData.section}
                    onChange={(e) => handleInputChange("section", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
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