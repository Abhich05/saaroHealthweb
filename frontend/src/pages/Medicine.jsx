import React, { useState, useEffect, useContext } from "react";
import { FiSearch } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";
import Modal from '../components/ui/GenericModal'; // adjust path as needed
import Pagination from "../components/ui/Pagination"; // ✅ Import pagination
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";

const columns = [
  { label: "Name", accessor: "name" },
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
  const pageSize = 6;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doctorId = useContext(DoctorIdContext);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/doctor/${doctorId}/medicine`)
      .then(res => {
        setMedicinesList(Array.isArray(res.data.medicines) ? res.data.medicines : []);
      })
      .catch(() => {
        setMedicinesList([]);
        setError("Failed to fetch medicines. Please try again.");
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

  const handleSaveMedicine = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newMedicine = { ...formData };

    if (editIndex !== null) {
      const updatedList = [...medicinesList];
      updatedList[editIndex] = newMedicine;
      setMedicinesList(updatedList);
    } else {
      const newList = [newMedicine, ...medicinesList];
      setMedicinesList(newList);

      const newTotalPages = Math.ceil(newList.filter((med) => med.name.toLowerCase().includes(searchTerm.toLowerCase())).length / pageSize);
      setCurrentPage(newTotalPages);
    }

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
  };

  const handleEdit = (index) => {
    setFormData(filteredMedicines[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    const updatedList = [...medicinesList];
    updatedList.splice(deleteIndex, 1);
    setMedicinesList(updatedList);
    setDeleteIndex(null);
    setIsDeleteModalOpen(false);
  };

  const filteredMedicines = medicinesList.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / pageSize);
  const paginatedData = filteredMedicines.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          <div className="max-w-[90%] mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl leading-10 font-semibold">Medicines</h2>
              <Button
                className="bg-[#7042D9] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#e0dbf6]"
                onClick={() => {
                  setFormData({
                    name: "",
                    composition: "",
                    frequency: "",
                    dosage: "",
                    notes: "",
                    createdBy: "",
                  });
                  setEditIndex(null);
                  setIsModalOpen(true);
                }}
              >
                + Add Medicine
              </Button>
            </div>

            <div className="relative w-full mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder=" Search Medicine"
                className="w-full pl-10 pr-4 py-2 border rounded-xl bg-[#f1ecf9] text-[#000000] focus:outline-none text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="overflow-x-auto  rounded-xl">
              <GenericTable
                columns={columns}
                data={paginatedData.map((med, index) => ({
                  ...med,
                  actions: (
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
                renderCell={(row, accessor) => {
                  if (accessor === "actions") {
                    return row[accessor];
                  }
                  return <span className="text-sm text-[#7c69a7]">{row[accessor]}</span>;
                }}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </main>

       
        
        <Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title={editIndex !== null ? "Edit Medicine" : "Add Medicine"}
>
  <div className="grid grid-cols-1 gap-4">
    {["name", "composition", "frequency", "dosage", "notes", "createdBy"].map((field) => (
      <div key={field}>
        <input
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        {errors[field] && (
          <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
        )}
      </div>
    ))}
  </div>

  <div className="flex justify-end gap-4 mt-6">
    <button
      onClick={() => setIsModalOpen(false)}
      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
    >
      Cancel
    </button>
    <button
      onClick={handleSaveMedicine}
      className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
    >
      Save
    </button>
  </div>
</Modal>


        {/* Delete confirm modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this medicine?</p>
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

export default Medicines;



 {/* {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">
                {editIndex !== null ? "Edit Medicine" : "Add Medicine"}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {["name", "composition", "frequency", "dosage", "notes", "createdBy"].map(
                  (field) => (
                    <div key={field}>
                      <input
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMedicine}
                  className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}*/}