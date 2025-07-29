import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import Modal from "../components/ui/GenericModal"
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";
import SearchBar from '../components/ui/SearchBar';
import Pagination from "../components/ui/Pagination"; // using your existing Pagination
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";

const categoryOptions = ["All", "New", "Follow-up", "Chronic", "Emergency"];

const columns = [
  { label: "UID", accessor: "uid" },
  { label: "Name", accessor: "name" },
  { label: "Phone", accessor: "phone" },
  { label: "Last Visit", accessor: "lastVisit" },
  { label: "Category", accessor: "category" },
  { label: "Action", accessor: "action" },
];


const AllPatients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Category");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [patients, setPatients] = useState([]); // Start with empty array
  const navigate = useNavigate();
  const doctorId = useContext(DoctorIdContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    primaryPhone: "",
    alternatePhone: "",
    title: "",
    fullName: "",
    fatherSpouseName: "",
    dob: "",
    age: "",
    gender: "",
    email: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    category: "",
    referredBy: "",
  });
  const [errors, setErrors] = useState({});

  const [pagination, setPagination] = useState({ totalPatients: 0, page: 1, limit: 7 });
  const rowsPerPage = 7;

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (formData.primaryPhone.length !== 10) {
      newErrors.primaryPhone = "Primary phone must be exactly 10 digits.";
    }
    if (formData.alternatePhone.length !== 0 && formData.alternatePhone.length !== 10) {
      newErrors.alternatePhone = "Alternate phone must be exactly 10 digits.";
    }
    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters.";
    }
    return newErrors;
  };

  const handleRegisterPatient = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!doctorId) return;
    // Build payload according to backend validation
    const payload = {
      fullName: formData.fullName,
      phoneNumber: String(formData.primaryPhone), // as string
      gender: formData.gender, // must be 'Male', 'Female', or 'Other'
      ...(formData.alternatePhone && formData.alternatePhone.length === 10 && { alternatePhoneNumber: String(formData.alternatePhone) }),
      ...(formData.fatherSpouseName && { spouseName: formData.fatherSpouseName }),
      ...(formData.dob && { dateOfBirth: formData.dob }),
      ...(formData.age && { age: Number(formData.age) }),
      ...(formData.email && { email: formData.email }),
      ...(formData.address && { address: formData.address }),
      ...(formData.bloodGroup && { bloodGroup: formData.bloodGroup }),
      ...(formData.allergies && { allergies: formData.allergies }),
      ...(formData.referredBy && { referredBy: formData.referredBy }),
      category: formData.category || 'New',
      // tags: undefined // Omit unless you want to send a string
    };
    console.log('Register Patient Payload:', payload);
    axiosInstance.post(`/patient/${doctorId}`, payload)
      .then(() => {
        // Refresh patient list
        axiosInstance.get(`/patient/get-all/${doctorId}?page=${pagination.page}&limit=${pagination.limit}`)
          .then(res => {
            const patients = Array.isArray(res.data.patient) ? res.data.patient : [];
            setPatients(patients.map(mapPatientToTableRow));
            setPagination(prev => ({
              ...prev,
              totalPatients: res.data.pagination?.totalPatients || patients.length
            }));
          })
          .catch(() => setPatients([]));
        setFormData({
          primaryPhone: "",
          alternatePhone: "",
          title: "",
          fullName: "",
          fatherSpouseName: "",
          dob: "",
          age: "",
          gender: "",
          email: "",
          address: "",
          bloodGroup: "",
          allergies: "",
          category: "",
          referredBy: "",
        });
        setErrors({});
        setShowMoreOptions(false);
        setIsModalOpen(false);
      })
      .catch(err => {
        setErrors({ api: err.response?.data?.error || 'Failed to add patient' });
      });
  };

  const filteredPatients = patients.filter((row) => {
   const matchesSearch = ["name", "uid", "phone"].some((key) =>
  row[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
);

    const matchesCategory =
      categoryFilter === "Category" || categoryFilter === "All" || row.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil((pagination.totalPatients || patients.length) / pagination.limit));

  // After fetching patients, map them to table rows for display
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    axiosInstance.get(`/patient/get-all/${doctorId}?page=${pagination.page}&limit=${pagination.limit}&searchQuery=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        const patients = Array.isArray(res.data.patient) ? res.data.patient : [];
        setPatients(patients.map(mapPatientToTableRow));
        setPagination(prev => ({
          ...prev,
          totalPatients: res.data.pagination?.totalPatients || patients.length
        }));
      })
      .catch((err) => {
        setPatients([]);
        setError("Failed to fetch patients. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId, pagination.page, pagination.limit, searchTerm]);

  const mapPatientToTableRow = (patient) => {
    // If patient is nested under patientId (from .populate)
    const p = patient.patientId ? patient.patientId : patient;
    return {
      uid: (p.uid || (typeof p._id === 'string' ? p._id.slice(-5) : '')) + '',
      name: (p.fullName || p.name || '') + '',
      phone: (p.phoneNumber || p.phone || '') + '',
      lastVisit: (p.lastVisit || (p.updatedAt ? String(p.updatedAt).slice(0, 10) : '')) + '',
      category: (p.category || 'New') + '',
      action: 'View',
      _id: p._id && typeof p._id === 'string' ? p._id : '',
    };
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
          <div className="max-w-[90%] mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl leading-10 font-semibold">All Patients</h1>
              <Button onClick={() => setIsModalOpen(true)}>
                Register Patient
              </Button>
            </div>

             <SearchBar
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      placeholder="Name, Phone, UID"
    />

            <div className="mb-4 relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
              >
                <span>{categoryFilter}</span>
                <IoIosArrowDown />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute mt-2 bg-white border rounded shadow text-sm z-50">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                        categoryFilter === category ? "bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        setCategoryFilter(category);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <GenericTable
              columns={columns}
              data={patients}
              renderCell={(row, accessor) => {
                if (accessor === "category") {
                  return (
                    <span className="text-sm px-3 py-1 bg-purple-100 text-purple-800 w-[120px] text-center rounded-full inline-block">
                      {row.category}
                    </span>
                  );
                }
                if (accessor === "action") {
                  return (
                    <button
  className="text-[#7c69a7] font-medium text-sm"
  onClick={() => navigate(`/view-history/${row.uid}`, { state: { patient: row } })}
>
  View History
</button>
                  );
                }
                if (accessor === "name") {
                  return <span className="text-sm">{row[accessor]}</span>;
                }
                return (
                  <span className="text-sm text-[#69598C]">
                    {row[accessor]}
                  </span>
                );
              }}
            />
            {patients.length === 0 && (
              <div className="text-center text-gray-500 py-8">Data Not Found</div>
            )}

            {/* Always render Pagination, even if only one page */}
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={Math.max(1, totalPages)}
                onPageChange={page => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        </main>

        {/*{isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white max-h-[90vh] rounded-xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    placeholder="Primary Phone Number"
                    value={formData.primaryPhone}
                    onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                  {errors.primaryPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.primaryPhone}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="Alternate Phone Number (Optional)"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                  {errors.alternatePhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>
                  )}
                </div>
                <input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <div>
                  <input
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                <input
                  placeholder="Father/Spouse Name"
                  value={formData.fatherSpouseName}
                  onChange={(e) => handleInputChange("fatherSpouseName", e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="DOB (dd/mm/yyyy)"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="border px-3 py-2 rounded"
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  placeholder="Email Address (Optional)"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="border px-3 py-2 rounded col-span-2"
                />
              </div>

              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="mt-4 text-purple-600 font-medium"
              >
                {showMoreOptions ? "Hide Options" : "More Options"}
              </button>

              {showMoreOptions && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input
                    placeholder="Blood Group"
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="Allergies (Optional)"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="border px-3 py-2 rounded"
                  >
                    <option value="">Select Category</option>
                    <option value="New">New</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Chronic">Chronic</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  <input
                    placeholder="Referred By"
                    value={formData.referredBy}
                    onChange={(e) => handleInputChange("referredBy", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterPatient}
                  className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}*/}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Patient">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleRegisterPatient();
            }}
          >
            {/* ⬇ Paste all your form elements inside here ⬇ */}
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white max-h-[90vh] rounded-xl shadow-lg w-full max-w-xl p-6 relative overflow-y-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
                >
                  &times;
                </button>
                <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      placeholder="Primary Phone Number"
                      value={formData.primaryPhone}
                      onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                      className="border px-3 py-2 rounded w-full"
                    />
                    {errors.primaryPhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.primaryPhone}</p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="Alternate Phone Number (Optional)"
                      value={formData.alternatePhone}
                      onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      className="border px-3 py-2 rounded w-full"
                    />
                    {errors.alternatePhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>
                    )}
                  </div>
                  <input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <div>
                    <input
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="border px-3 py-2 rounded w-full"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  <input
                    placeholder="Father/Spouse Name"
                    value={formData.fatherSpouseName}
                    onChange={(e) => handleInputChange("fatherSpouseName", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="DOB (dd/mm/yyyy)"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="border px-3 py-2 rounded appearance-none w-full"
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ▼
                    </div>
                  </div>

                  <input
                    placeholder="Email Address (Optional)"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="border px-3 py-2 rounded col-span-2"
                  />
                </div>

                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="mt-4 text-purple-600 font-medium"
                >
                  {showMoreOptions ? "Hide Options" : "More Options"}
                </button>

                {showMoreOptions && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <input
                      placeholder="Blood Group"
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                      className="border px-3 py-2 rounded"
                    />
                    <input
                      placeholder="Allergies (Optional)"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      className="border px-3 py-2 rounded"
                    />
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="border px-3 py-2 rounded appearance-none w-full"
                      >
                        <option value="">Select Category</option>
                        <option value="New">New</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Chronic">Chronic</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ▼
                      </div>
                    </div>

                    <input
                      placeholder="Referred By"
                      value={formData.referredBy}
                      onChange={(e) => handleInputChange("referredBy", e.target.value)}
                      className="border px-3 py-2 rounded"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal>

      </div>
    </div>
  );
};

export default AllPatients;
