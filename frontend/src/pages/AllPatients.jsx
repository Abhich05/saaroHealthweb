import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import Modal from "../components/ui/GenericModal"
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";
import SearchBar from '../components/ui/SearchBar';
import Pagination from "../components/ui/Pagination"; // using your existing Pagination
import { DoctorIdContext } from '../App';

// Category filter options are rendered as capsules; no dropdown needed

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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [patients, setPatients] = useState([]); // Start with empty array
  const navigate = useNavigate();
  const doctorId = useContext(DoctorIdContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestCtrlRef = useRef(null);
  const isMountedRef = useRef(true);
  const mountedAtRef = useRef(Date.now());

  // RBAC: read permissions from localStorage
  const getPermissions = () => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return { createRx: 'full' };
      const parsed = JSON.parse(raw);
      return parsed?.permissions || { createRx: 'full' };
    } catch { return { createRx: 'full' }; }
  };
  const [permissions] = useState(getPermissions());
  const canRegister = permissions?.createRx === 'full';

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
  // Sorting state
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const handleSort = (accessor) => {
    setSortBy(prev => {
      if (prev === accessor) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return accessor;
    });
  };
  // Filtered patients by category
  const filteredPatients = patients.filter(p => categoryFilter === 'All' || p.category === categoryFilter);

  // Simple SWR cache (sessionStorage)
  const cacheGet = (key) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.patients)) return null;
      return obj;
    } catch { return null; }
  };
  const cacheSet = (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  // Debounce search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 400);
    return () => clearTimeout(h);
  }, [searchTerm]);

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
      .then(async () => {
        // Refresh patient list using the same fetch util with params
        await fetchPatients();
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

  //const filteredPatients = patients.filter((row) => {
   //const matchesSearch = ["name", "uid", "phone"].some((key) =>
  //row[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//);

    //const matchesCategory =
      //categoryFilter === "Category" || categoryFilter === "All" || row.category === categoryFilter;
    //return matchesSearch && matchesCategory;
  //});

  const totalPages = Math.max(1, Math.ceil((pagination.totalPatients || patients.length) / pagination.limit));

  // After fetching patients, map them to table rows for display
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  const fetchPatients = async (attempt = 0) => {
    if (!doctorId) return;
    // cancel any in-flight request before starting a new one
    if (requestCtrlRef.current) { try { requestCtrlRef.current.abort(); } catch {} }
    const controller = new AbortController();
    requestCtrlRef.current = controller;
    // Early abort in ~8s to avoid long loaders (axios has 10s timeout)
    const abortId = setTimeout(() => {
      try { controller.abort(); } catch {}
    }, 8000);
    setLoading(true);
    setError(null);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (debouncedSearchTerm) params.searchQuery = debouncedSearchTerm;
      if (sortBy) { params.sortBy = sortBy; params.sortDir = sortDir || 'asc'; }
      // Prefill from cache to avoid showing loader
      const cacheKey = `patients:${doctorId}:${params.page}:${params.limit}:${params.searchQuery || ''}:${params.sortBy || ''}:${params.sortDir || ''}`;
      const cached = cacheGet(cacheKey);
      if (cached && patients.length === 0) {
        if (!isMountedRef.current) return;
        setPatients(cached.patients.map(mapPatientToTableRow));
        setPagination(prev => ({ ...prev, totalPatients: cached.total || cached.patients.length }));
        setLoading(false); // hide loader while revalidating
      }
      const res = await axiosInstance.get(`/patient/get-all/${doctorId}`, { params, signal: controller.signal });
      const list = Array.isArray(res.data.patient) ? res.data.patient : [];
      if (!isMountedRef.current) return;
      setPatients(list.map(mapPatientToTableRow));
      setPagination(prev => ({ ...prev, totalPatients: res.data.pagination?.totalPatients || list.length }));
      // Write cache
      cacheSet(cacheKey, { patients: list, total: res.data.pagination?.totalPatients || list.length, ts: Date.now() });
    } catch (e) {
      const code = e?.code || e?.name;
      const msg = (e?.message || '').toLowerCase();
      if (
        code === 'ERR_CANCELED' ||
        code === 'CanceledError' ||
        code === 'AbortError' ||
        msg.includes('canceled') ||
        msg.includes('cancelled') ||
        msg.includes('aborted')
      ) {
        return;
      }
      // Retry on transient errors (network or 5xx)
      const status = e?.response?.status;
      const isTransient = !status || (status >= 500 && status <= 599);
      if (isTransient && attempt < 2) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 300 * (attempt + 1) * 2));
        return fetchPatients(attempt + 1);
      }
      if (!isMountedRef.current) return;
      const justMounted = Date.now() - mountedAtRef.current < 800;
      // Do not wipe existing data; only show error banner if we have nothing to show and not in initial window
      setError(prev => ((patients && patients.length > 0) || justMounted ? prev : "Failed to fetch patients. Please try again."));
    } finally {
      try { clearTimeout(abortId); } catch {}
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [doctorId, pagination.page, pagination.limit, debouncedSearchTerm, sortBy, sortDir]);

  // Abort any pending request on unmount and prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (requestCtrlRef.current) {
        try { requestCtrlRef.current.abort(); } catch {}
      }
    };
  }, []);

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

  // Inline error banner instead of full-page block

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchPatients}
                  className="bg-red-600 text-white text-sm px-3 py-1 rounded"
                >
                  Retry
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl leading-10 font-semibold">All Patients</h1>
              <Button onClick={() => setIsModalOpen(true)} disabled={!canRegister}>
                Register Patient
              </Button>
            </div>

            {/* Category Capsules */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['All','New','Follow-up','Chronic','Emergency'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all ${
                    categoryFilter === cat ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Name, Phone, UID"
            />

            {/* Removed redundant category dropdown; capsules above control category */}

            <GenericTable
              columns={columns}
              data={filteredPatients}
              loading={loading}
              loadingRows={10}
              sortable
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
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

            {/* Rows per page selector + Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="ap-pageSize" className="text-gray-600">Rows per page:</label>
                <select
                  id="ap-pageSize"
                  value={pagination.limit}
                  onChange={e => setPagination(prev => ({ ...prev, page: 1, limit: Number(e.target.value) }))}
                  className="border rounded px-2 py-1"
                >
                  {[7, 10, 25, 50].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
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
