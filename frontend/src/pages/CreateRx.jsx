import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import Modal from '../components/ui/GenericModal';
import SearchBar from "../components/ui/SearchBar"; // adjust path if needed

import Button from "../components/ui/Button";
import { useContext } from "react";
import { DoctorIdContext } from "../App";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";
import Pagination from "../components/ui/Pagination"; // We'll define this below
import Loading from "../components/ui/Loading";

const columns = [
  { label: "UID", accessor: "uid" },
  { label: "Name", accessor: "name" },
  { label: "Phone", accessor: "phone" },
  { label: "Last Visit", accessor: "lastVisit" },
  { label: "Category", accessor: "category" },
  { label: "Action", accessor: "action" },
];

const generateUID = () => Math.floor(10000 + Math.random() * 90000).toString();

const mapPatientToTableRow = (patient) => {
  // If patient is nested under patientId (from .populate)
  const p = patient.patientId ? patient.patientId : patient;
  console.log('Patient row:', p, 'Category:', p.category); // Debug log
  return {
    uid: (p.uid || (typeof p._id === 'string' ? p._id.slice(-5) : '')) + '',
    name: (p.fullName || p.name || '') + '',
    phone: (p.phoneNumber || p.phone || '') + '',
    lastVisit: (p.lastVisit || (p.updatedAt ? String(p.updatedAt).slice(0, 10) : '')) + '',
    category: (p.category || 'Follow-up') + '',
    action: 'Consult',
    _id: p._id && typeof p._id === 'string' ? p._id : '',
  };
};

const CreateRx = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const doctorId = useContext(DoctorIdContext);
  const [rxData, setRxData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    lastVisit: "",
    category: "Follow-up",
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/patient/get-all/${doctorId}?page=${pagination.page}&limit=${pagination.limit}&searchQuery=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        const patients = Array.isArray(res.data.patient) ? res.data.patient : [];
        setRxData(patients);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination?.totalPatients || patients.length
        }));
        setMappedData(patients.map(mapPatientToTableRow));
      })
      .catch(() => {
        setRxData([]);
        setMappedData([]);
        setError("Failed to fetch patients. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId, pagination.page, pagination.limit, searchTerm]);

  const handleRegisterPatient = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowMoreOptions(false);
    setNewPatient({ name: "", phone: "", lastVisit: "", category: "Follow-up" });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newPatient.name || newPatient.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (!/^[0-9]{10}$/.test(newPatient.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    if (!newPatient.gender || !['Male', 'Female', 'Other'].includes(newPatient.gender)) {
      newErrors.gender = "Gender is required";
    }
    if (newPatient.altPhone && !/^[0-9]{10}$/.test(newPatient.altPhone)) {
      newErrors.altPhone = "Alternate phone must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPatient = () => {
    console.log('handleAddPatient called');
    if (!validateForm()) {
      console.log('Validation failed', errors);
      return;
    }
    if (!doctorId) {
      console.log('No doctorId');
      return;
    }
    const payload = {
      fullName: newPatient.name,
      phoneNumber: String(newPatient.phone), // as string
      gender: newPatient.gender,
      category: newPatient.category, // <-- Add this line
      ...(newPatient.altPhone && /^[0-9]{10}$/.test(newPatient.altPhone) ? { alternatePhoneNumber: String(newPatient.altPhone) } : {}),
      spouseName: newPatient.fatherName || undefined,
      dateOfBirth: newPatient.dob || undefined,
      age: newPatient.age ? Number(newPatient.age) : undefined,
      email: newPatient.email || undefined,
      address: newPatient.address || undefined,
      bloodGroup: newPatient.bloodGroup || undefined,
      allergies: newPatient.allergies || undefined,
      referredBy: newPatient.referredBy || undefined
      // tags: undefined // Omit unless you want to send a string
    };
    console.log('Register Patient Payload:', payload);
    setLoading(true);
    setError("");
    axiosInstance.post(`/patient/${doctorId}`, payload)
      .then((res) => {
        console.log('POST response', res);
        // Refresh Rx list
        axiosInstance.get(`/patient/get-all/${doctorId}?page=${pagination.page}&limit=${pagination.limit}&searchQuery=${encodeURIComponent(searchTerm)}`)
          .then(res => {
            const patients = Array.isArray(res.data.patient) ? res.data.patient : [];
            setRxData(patients);
            setPagination(prev => ({
              ...prev,
              total: res.data.pagination?.totalPatients || patients.length
            }));
            setMappedData(patients.map(mapPatientToTableRow));
          })
          .catch(() => {
            setRxData([]);
            setError("Failed to fetch patients after adding.");
          });
        handleCloseModal();
      })
      .catch(err => {
        console.log('POST error', err);
        setErrors({ api: err.response?.data?.error || 'Failed to add patient' });
        setError(err.response?.data?.error || 'Failed to add patient');
      })
      .finally(() => setLoading(false));
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

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl leading-10 font-semibold">Create Rx</h1>
              <Button onClick={handleRegisterPatient}>Register Patient</Button>
            </div>

            <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Search by Name, UID, Phone"
      />

            <GenericTable
              columns={columns}
              data={mappedData}
              loading={loading}
              loadingRows={8}
              renderCell={(row, accessor) => {
                if (accessor === "category") {
                  const colorMap = {
                    "Follow-up": "bg-purple-100 text-purple-700",
                    "Emergency": "bg-red-100 text-red-600",
                    "Chronic": "bg-blue-100 text-blue-600",
                  };
                  return (
                    <span className={`text-sm px-3 py-1 rounded-full ${colorMap[row.category]}`}>
                      {row.category}
                    </span>
                  );
                }

                if (accessor === "action") {
                  return (
                    <Link to={`/${row.uid}/consult`}>
                      <span className={`text-sm px-3 py-1 text-[#69598C] text-700 hover:underline cursor-pointer`}>
                        Consult
                      </span>
                    </Link>
                  );
                }

                const highlightColor = ["uid", "phone", "lastVisit"].includes(accessor)
                  ? "text-[#69598C] text-400"
                  : "";

                // Fallback: always render as string
                const value = row[accessor];
                return <span className={`text-sm ${highlightColor}`}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>;
              }}
            />

            {/* Always render Pagination, even if only one page */}
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={totalPages}
                onPageChange={page => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        </main>

        
        {<Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title="Add Patient"
        >
          {/* move your entire patient form code inside here */}
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl space-y-4 overflow-y-auto max-h-[90vh]">
                      <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input value="+91" disabled className="w-full border rounded-md px-4 py-2 text-sm bg-gray-100" />
                        <input
                          type="text"
                          placeholder="Primary Phone Number"
                          value={newPatient.phone}
                          onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                          className="w-full border rounded-md px-4 py-2 text-sm md:col-span-2"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

                      <input
                        type="text"
                        placeholder="Alternate Phone Number (Optional)"
                        value={newPatient.altPhone || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, altPhone: e.target.value })}
                        className="w-full border rounded-md px-4 py-2 text-sm"
                      />
                      {errors.altPhone && <p className="text-red-500 text-xs">{errors.altPhone}</p>}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
  <select
    value={newPatient.title || ""}
    onChange={(e) => setNewPatient({ ...newPatient, title: e.target.value })}
    className="w-full border rounded-md px-4 py-2 text-sm appearance-none"
  >
    <option value="">Title</option>
    <option>Mr</option>
    <option>Ms</option>
    <option>Mrs</option>
    <option>Dr</option>
  </select>
  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
    ▼
  </div>
</div>

                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newPatient.name}
                          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                          className="w-full border rounded-md px-4 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Father/Spouse Name"
                          value={newPatient.fatherName || ""}
                          onChange={(e) => setNewPatient({ ...newPatient, fatherName: e.target.value })}
                          className="w-full border rounded-md px-4 py-2 text-sm"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="date"
                          value={newPatient.dob || ""}
                          onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                          className="w-full border rounded-md px-4 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          value={newPatient.age || ""}
                          onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                          className="w-full border rounded-md px-4 py-2 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
  <select
    value={newPatient.gender || ""}
    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
    className="w-full border rounded-md px-4 py-2 text-sm appearance-none"
  >
    <option value="">Gender</option>
    <option>Male</option>
    <option>Female</option>
    <option>Other</option>
  </select>
  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
    ▼
  </div>
</div>

                        <input
                          type="email"
                          placeholder="Email Address (Optional)"
                          value={newPatient.email || ""}
                          onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                          className="w-full border rounded-md px-4 py-2 text-sm"
                        />
                      </div>

                      <textarea
                        placeholder="Address"
                        value={newPatient.address || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                        className="w-full border rounded-md px-4 py-2 text-sm"
                        rows={2}
                      />

                      <button
                        className="px-4 py-1 border rounded-full text-sm font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200"
                        onClick={() => setShowMoreOptions((prev) => !prev)}
                      >
                        {showMoreOptions ? "Hide Options" : "... More Options"}
                      </button>

                      {showMoreOptions && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Blood Group"
                            value={newPatient.bloodGroup || ""}
                            onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                            className="w-full border rounded-md px-4 py-2 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Allergies (Optional)"
                            value={newPatient.allergies || ""}
                            onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                            className="w-full border rounded-md px-4 py-2 text-sm"
                          />
                          <div className="relative">
  <select
    value={newPatient.category}
    onChange={(e) => setNewPatient({ ...newPatient, category: e.target.value })}
    className="w-full border rounded-md px-4 py-2 text-sm appearance-none"
  >
    <option value="Follow-up">Follow-up</option>
    <option value="Emergency">Emergency</option>
    <option value="Chronic">Chronic</option>
  </select>
  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
    ▼
  </div>
</div>

                          <input
                            type="text"
                            placeholder="Referred By"
                            value={newPatient.referredBy || ""}
                            onChange={(e) => setNewPatient({ ...newPatient, referredBy: e.target.value })}
                            className="w-full border rounded-md px-4 py-2 text-sm"
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-4 mt-4">
                        <button
                          onClick={handleCloseModal}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddPatient}
                          className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
          </div>
        </Modal>}

      </div>
    </div>
  );
};

export default CreateRx;




{/*{isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl space-y-4 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value="+91" disabled className="w-full border rounded-md px-4 py-2 text-sm bg-gray-100" />
                <input
                  type="text"
                  placeholder="Primary Phone Number"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm md:col-span-2"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

              <input
                type="text"
                placeholder="Alternate Phone Number (Optional)"
                value={newPatient.altPhone || ""}
                onChange={(e) => setNewPatient({ ...newPatient, altPhone: e.target.value })}
                className="w-full border rounded-md px-4 py-2 text-sm"
              />
              {errors.altPhone && <p className="text-red-500 text-xs">{errors.altPhone}</p>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newPatient.title || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, title: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                >
                  <option value="">Title</option>
                  <option>Mr</option>
                  <option>Ms</option>
                  <option>Mrs</option>
                  <option>Dr</option>
                </select>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Father/Spouse Name"
                  value={newPatient.fatherName || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, fatherName: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newPatient.dob || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={newPatient.age || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newPatient.gender || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                >
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={newPatient.email || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
              </div>

              <textarea
                placeholder="Address"
                value={newPatient.address || ""}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full border rounded-md px-4 py-2 text-sm"
                rows={2}
              />

              <button
                className="px-4 py-1 border rounded-full text-sm font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200"
                onClick={() => setShowMoreOptions((prev) => !prev)}
              >
                {showMoreOptions ? "Hide Options" : "... More Options"}
              </button>

              {showMoreOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Blood Group"
                    value={newPatient.bloodGroup || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full border rounded-md px-4 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Allergies (Optional)"
                    value={newPatient.allergies || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    className="w-full border rounded-md px-4 py-2 text-sm"
                  />
                  <select
                    value={newPatient.category}
                    onChange={(e) => setNewPatient({ ...newPatient, category: e.target.value })}
                    className="w-full border rounded-md px-4 py-2 text-sm"
                  >
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Chronic">Chronic</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Referred By"
                    value={newPatient.referredBy || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, referredBy: e.target.value })}
                    className="w-full border rounded-md px-4 py-2 text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}*/}