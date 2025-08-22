import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/GenericModal";
import ModalToast from "../components/ui/ModalToast";
import Pagination from "../components/ui/Pagination";
import { DoctorIdContext } from "../App";
import axiosInstance from "../api/axiosInstance";

const generateUID = () => Math.floor(10000 + Math.random() * 90000).toString();

const mapPatientToTableRow = (patient) => {
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

const CreateRx = () => {
  const doctorId = useContext(DoctorIdContext);
  const requestCtrlRef = useRef(null);
  const isMountedRef = useRef(true);
  const [rxData, setRxData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  // Debounced search: separate input vs effective term
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [existingPatientModal, setExistingPatientModal] = useState(false);
  const [existingPatient, setExistingPatient] = useState(null);
  const [modalErrors, setModalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalToast, setModalToast] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Utility: delay helper for retries
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // RBAC: derive minimal permissions from localStorage (fallback to full)
  const getPermissions = () => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return { createRx: 'full' };
      const parsed = JSON.parse(raw);
      return parsed?.permissions || { createRx: 'full' };
    } catch { return { createRx: 'full' }; }
  };
  const [permissions, setPermissions] = useState(getPermissions());
  const canRegister = permissions?.createRx === 'full';
  // Track when component mounted to suppress transient errors on initial load
  const mountedAtRef = useRef(Date.now());

  // Sorting state (declare early so it's available in fetchPatients)
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // New patient form data
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    altPhone: "",
    title: "",
    fatherName: "",
    dob: "",
    age: "",
    gender: "",
    email: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    category: "Follow-up",
    referredBy: ""
  });

  // Show modal toast function
  const showModalToast = (message, type = 'error', duration = 4000) => {
    setModalToast({ message, type, duration });
  };

  // Fetch patients with retry (exponential backoff on transient errors)
  const fetchPatients = async (attempt = 0) => {
    if (!doctorId) return;
    // cancel any in-flight request before starting a new one
    if (requestCtrlRef.current) {
      try { requestCtrlRef.current.abort(); } catch {}
    }
    const controller = new AbortController();
    requestCtrlRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const t0 = performance.now();
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.searchQuery = searchTerm;
      if (sortBy) { params.sortBy = sortBy; params.sortDir = sortDir || 'asc'; }
      const res = await axiosInstance.get(`/patient/get-all/${doctorId}`, { params, signal: controller.signal });
      const patients = Array.isArray(res.data.patient) ? res.data.patient : [];
      setRxData(patients);
      setMappedData(patients.map(mapPatientToTableRow));
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination?.totalPatients || patients.length
      }));
      const t1 = performance.now();
      console.debug('[metrics] fetchPatients duration(ms):', Math.round(t1 - t0), { page: pagination.page, limit: pagination.limit, search: !!searchTerm });
    } catch (err) {
      // Ignore cancellations due to navigation or rapid param changes
      const code = err?.code || err?.name;
      const msg = (err?.message || '').toLowerCase();
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
      const status = err?.response?.status;
      const isTransient = !status || (status >= 500 && status <= 599);
      if (isTransient && attempt < 2) {
        // retry with backoff: 300ms, 1200ms
        await delay((attempt + 1) * 300 * (attempt + 1) * 2);
        return fetchPatients(attempt + 1);
      } else {
        const errorMessage = "Failed to fetch patients. Please try again.";
        if (!isMountedRef.current) return;
        // Only surface error if there is no existing data to show
        const justMounted = Date.now() - mountedAtRef.current < 800;
        setError(prev => (rxData && rxData.length > 0 ? prev : (justMounted ? prev : errorMessage)));
        if (isModalOpen && (!rxData || rxData.length === 0)) {
          showModalToast(errorMessage, 'error', 4000);
        }
        console.warn('[metrics] fetchPatients error', { status, attempt });
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctorId, pagination.page, pagination.limit, searchTerm, sortBy, sortDir]);

  // Abort any pending request on unmount and prevent state updates
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (requestCtrlRef.current) {
        try { requestCtrlRef.current.abort(); } catch {}
      }
    };
  }, []);

  // Debounce search input into searchTerm
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Ensure we start from page 1 whenever search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  const handleRegisterPatient = () => {
    setModalErrors({});
    setNewPatient({
      name: "",
      phone: "",
      altPhone: "",
      title: "",
      fatherName: "",
      dob: "",
      age: "",
      gender: "",
      email: "",
      address: "",
      bloodGroup: "",
      allergies: "",
      category: "Follow-up",
      referredBy: ""
    });
    setShowMoreOptions(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalErrors({});
    setExistingPatientModal(false);
    setExistingPatient(null);
    setModalToast(null);
  };

  // Check if patient already exists
  const checkExistingPatient = async (phone) => {
    try {
      const res = await axiosInstance.get(`/patient/check/${doctorId}?phone=${phone}`);
      if (res.data.exists) {
        setExistingPatient(res.data.patient);
        setExistingPatientModal(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking existing patient:', err);
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic Information Section
    if (!newPatient.title || newPatient.title.trim() === '') {
      newErrors.title = "Title is required";
    }
    if (!newPatient.name || newPatient.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (!/^[0-9]{10}$/.test(newPatient.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    if (!newPatient.gender || !['Male', 'Female', 'Other'].includes(newPatient.gender)) {
      newErrors.gender = "Gender is required";
    }
    
    // Personal Information Section
    if (!newPatient.dob || newPatient.dob.trim() === '') {
      newErrors.dob = "Date of Birth is required";
    }
    if (newPatient.age && (isNaN(newPatient.age) || newPatient.age < 0 || newPatient.age > 150)) {
      newErrors.age = "Please enter a valid age";
    }
    
    // Contact Information Section
    if (newPatient.altPhone && !/^[0-9]{10}$/.test(newPatient.altPhone)) {
      newErrors.altPhone = "Alternate phone must be 10 digits";
    }
    if (newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setModalErrors(newErrors);
    
    // Show toast for validation errors
    if (Object.keys(newErrors).length > 0) {
      showModalToast('Please fill in all required fields correctly!', 'error', 4000);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPatient = async () => {
    if (!validateForm()) {
      return;
    }

    // Check for existing patient
    const exists = await checkExistingPatient(newPatient.phone);
    if (exists) {
      return; // Modal will be shown by checkExistingPatient
    }

    await submitPatient();
  };

  const submitPatient = async () => {
    if (!doctorId) return;
    
    setIsSubmitting(true);
    const payload = {
      title: newPatient.title,
      fullName: newPatient.name,
      phoneNumber: String(newPatient.phone),
      gender: newPatient.gender,
      category: newPatient.category,
      ...(newPatient.altPhone && /^[0-9]{10}$/.test(newPatient.altPhone) ? { alternatePhoneNumber: String(newPatient.altPhone) } : {}),
      spouseName: newPatient.fatherName || undefined,
      dateOfBirth: newPatient.dob,
      age: newPatient.age ? Number(newPatient.age) : undefined,
      email: newPatient.email || undefined,
      address: newPatient.address || undefined,
      bloodGroup: newPatient.bloodGroup || undefined,
      allergies: newPatient.allergies || undefined,
      referredBy: newPatient.referredBy || undefined
    };

    try {
      await axiosInstance.post(`/patient/${doctorId}`, payload);
      handleCloseModal();
      fetchPatients(); // Refresh the list
      showModalToast('Patient registered successfully!', 'success', 3000);
      auditLog('patient_register_success', { phone: payload.phoneNumber, name: payload.fullName });
    } catch (err) {
      // Handle 409 Conflict - Patient already exists
      if (err.response?.status === 409) {
        const errorMessage = err.response?.data?.error || 'Patient already exists';
        showModalToast(errorMessage, 'error', 4000);
        // Don't close modal, let user see the error
      } else {
        const errorMessage = err.response?.data?.error || 'Failed to add patient';
        setModalErrors({ api: errorMessage });
        showModalToast(errorMessage, 'error', 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToExisting = async () => {
    setExistingPatientModal(false);
    setIsSubmitting(true);
    
    try {
      // Update the existing patient with new information
      const updatePayload = {
        ...(newPatient.title && { title: newPatient.title }),
        ...(newPatient.name && { fullName: newPatient.name }),
        ...(newPatient.gender && { gender: newPatient.gender }),
        ...(newPatient.category && { category: newPatient.category }),
        ...(newPatient.altPhone && /^[0-9]{10}$/.test(newPatient.altPhone) ? { alternatePhoneNumber: String(newPatient.altPhone) } : {}),
        ...(newPatient.fatherName && { spouseName: newPatient.fatherName }),
        ...(newPatient.dob && { dateOfBirth: newPatient.dob }),
        ...(newPatient.age && { age: Number(newPatient.age) }),
        ...(newPatient.email && { email: newPatient.email }),
        ...(newPatient.address && { address: newPatient.address }),
        ...(newPatient.bloodGroup && { bloodGroup: newPatient.bloodGroup }),
        ...(newPatient.allergies && { allergies: newPatient.allergies }),
        ...(newPatient.referredBy && { referredBy: newPatient.referredBy })
      };

      // Only update if there are fields to update
      if (Object.keys(updatePayload).length > 0) {
        await axiosInstance.put(`/patient/${existingPatient._id}`, updatePayload);
      }
      
      handleCloseModal();
      fetchPatients(); // Refresh the list
      showModalToast('Patient information updated successfully!', 'success', 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update patient';
      showModalToast(errorMessage, 'error', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAsNew = () => {
    setExistingPatientModal(false);
    // Clear the phone number to avoid the same check again
    setNewPatient(prev => ({ ...prev, phone: "" }));
    // Open the main register patient modal
    setIsModalOpen(true);
  };

  // Do not block page on error; show inline banner instead

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

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

  // Client-side sort after mapping
  const sortedData = React.useMemo(() => {
    const arr = [...mappedData];
    if (!sortBy) return arr;
    arr.sort((a, b) => {
      const av = (a[sortBy] ?? '').toString().toLowerCase();
      const bv = (b[sortBy] ?? '').toString().toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [mappedData, sortBy, sortDir]);

  const filteredData = sortedData.filter(row => categoryFilter === "All" || row.category === categoryFilter);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl leading-10 font-semibold">Create Rx</h1>
              <div className="flex flex-col items-end">
                <div className="flex gap-2">
                  <Button onClick={handleRegisterPatient} disabled={!canRegister} title={!canRegister ? 'Insufficient permissions to register patients' : undefined}>Register Patient</Button>
                  <Button variant="outline" onClick={() => exportPatientsCSV(filteredData)}>
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div role="alert" aria-live="polite" className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
                <span className="font-semibold">Error:</span>
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => fetchPatients()}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  aria-label="Retry loading patients"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Category Capsules */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['All','Follow-up','Emergency','Chronic'].map(cat => (
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
              searchTerm={searchInput}
              setSearchTerm={setSearchInput}
              placeholder="Search by Name, UID, Phone"
            />

            <GenericTable
              columns={columns}
              data={filteredData}
              loading={loading}
              loadingRows={8}
              sortable={true}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
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
                    <div className="flex items-center gap-2">
                      <Link to={`/${row.uid}/consult`} onClick={() => auditLog('patient_consult_open', { uid: row.uid, patientId: row._id })}>
                        <span className={`text-sm px-3 py-1 text-[#69598C] text-700 hover:underline cursor-pointer`}>
                          Consult
                        </span>
                      </Link>
                    </div>
                  );
                }

                const highlightColor = ["uid", "phone", "lastVisit"].includes(accessor)
                  ? "text-[#69598C] text-400"
                  : "";

                const value = row[accessor];
                return <span className={`text-sm ${highlightColor}`}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>;
              }}
            />

            {/* Empty state */}
            {!loading && !error && filteredData.length === 0 && (
              <div className="mt-6 p-6 text-center border rounded-md bg-gray-50 text-gray-600">
                <p className="font-medium">No patients found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="pageSize" className="text-gray-600">Rows per page:</label>
                <select
                  id="pageSize"
                  value={pagination.limit}
                  onChange={e => setPagination(prev => ({ ...prev, page: 1, limit: Number(e.target.value) }))}
                  className="border rounded px-2 py-1"
                >
                  {[10, 25, 50].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={totalPages}
                onPageChange={page => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        </main>

        {/* Add Patient Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Add Patient"
          size="xl"
          className="mx-4"
        >
          <div className="relative space-y-6 max-h-[85vh] overflow-y-auto px-2">
            {/* Modal Toast */}
            {modalToast && (
              <ModalToast
                message={modalToast.message}
                type={modalToast.type}
                duration={modalToast.duration}
                onClose={() => setModalToast(null)}
              />
            )}
            {/* Contact Information Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value="+91" disabled className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-gray-100" />
                <div className="relative md:col-span-2">
                  <input
                    type="text"
                    placeholder=" "
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className={`w-full border rounded-md px-4 py-3 text-sm peer ${modalErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    aria-invalid={!!modalErrors.phone}
                    aria-describedby={modalErrors.phone ? 'err-phone' : undefined}
                  />
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                    Primary Phone Number *
                  </label>
                  {modalErrors.phone && (<p id="err-phone" className="mt-1 text-xs text-red-600">{modalErrors.phone}</p>)}
                </div>
              </div>
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder=" "
                  value={newPatient.altPhone || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, altPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  aria-invalid={!!modalErrors.altPhone}
                  aria-describedby={modalErrors.altPhone ? 'err-altPhone' : undefined}
                />
                <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                  Alternate Phone Number (Optional)
                </label>
                {modalErrors.altPhone && (<p id="err-altPhone" className="mt-1 text-xs text-red-600">{modalErrors.altPhone}</p>)}
              </div>
            </div>

            {/* Basic Information Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <select
                    value={newPatient.title || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, title: e.target.value })}
                    className={`w-full border rounded-md px-4 py-3 text-sm appearance-none peer ${modalErrors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    aria-invalid={!!modalErrors.title}
                    aria-describedby={modalErrors.title ? 'err-title' : undefined}
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
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not([value=''])]:-top-2 peer-[:not([value=''])]:left-2 peer-[:not([value=''])]:text-xs peer-[:not([value=''])]:bg-white peer-[:not([value=''])]:px-1">
                    Title *
                  </label>
                  {modalErrors.title && (<p id="err-title" className="mt-1 text-xs text-red-600">{modalErrors.title}</p>)}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder=" "
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className={`w-full border rounded-md px-4 py-3 text-sm peer ${modalErrors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    aria-invalid={!!modalErrors.name}
                    aria-describedby={modalErrors.name ? 'err-name' : undefined}
                  />
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                    Full Name *
                  </label>
                  {modalErrors.name && (<p id="err-name" className="mt-1 text-xs text-red-600">{modalErrors.name}</p>)}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder=" "
                    value={newPatient.fatherName || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, fatherName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  />
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                    Father/Spouse Name
                  </label>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="date"
                    value={newPatient.dob || ""}
                    onChange={(e) => {
                      const dob = e.target.value;
                      let age = "";
                      if (dob) {
                        const today = new Date();
                        const birthDate = new Date(dob);
                        age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                      }
                      setNewPatient({ ...newPatient, dob, age: age.toString() });
                    }}
                    className={`w-full border rounded-md px-4 py-3 text-sm peer ${modalErrors.dob ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    aria-invalid={!!modalErrors.dob}
                    aria-describedby={modalErrors.dob ? 'err-dob' : undefined}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                    Date of Birth *
                  </label>
                  {modalErrors.dob && (<p id="err-dob" className="mt-1 text-xs text-red-600">{modalErrors.dob}</p>)}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder=" "
                    value={newPatient.age || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                    readOnly
                  />
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                    Age
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="relative">
                  <select
                    value={newPatient.gender || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className={`w-full border rounded-md px-4 py-3 text-sm appearance-none peer ${modalErrors.gender ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    aria-invalid={!!modalErrors.gender}
                    aria-describedby={modalErrors.gender ? 'err-gender' : undefined}
                  >
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ▼
                  </div>
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not([value=''])]:-top-2 peer-[:not([value=''])]:left-2 peer-[:not([value=''])]:text-xs peer-[:not([value=''])]:bg-white peer-[:not([value=''])]:px-1">
                    Gender *
                  </label>
                  {modalErrors.gender && (<p id="err-gender" className="mt-1 text-xs text-red-600">{modalErrors.gender}</p>)}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    placeholder=" "
                    value={newPatient.email || ""}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                    aria-invalid={!!modalErrors.email}
                    aria-describedby={modalErrors.email ? 'err-email' : undefined}
                  />
                  <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                    Email Address (Optional)
                  </label>
                  {modalErrors.email && (<p id="err-email" className="mt-1 text-xs text-red-600">{modalErrors.email}</p>)}
                </div>
              </div>

              <div className="relative mt-4">
                <textarea
                  placeholder=" "
                  value={newPatient.address || ""}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  rows={2}
                />
                <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                  Address
                </label>
              </div>
            </div>


            {/* Additional Options */}
            <div>
              <button
                className="px-4 py-1 border rounded-full text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200"
                onClick={() => setShowMoreOptions((prev) => !prev)}
              >
                {showMoreOptions ? "Hide Options" : "... More Options"}
              </button>

              {showMoreOptions && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder=" "
                        value={newPatient.bloodGroup || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                      />
                      <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                        Blood Group
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder=" "
                        value={newPatient.allergies || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                      />
                      <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                        Allergies (Optional)
                      </label>
                    </div>

                    <div className="relative">
                      <select
                        value={newPatient.category}
                        onChange={(e) => setNewPatient({ ...newPatient, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                      >
                        <option value="Follow-up">Follow-up</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Chronic">Chronic</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ▼
                      </div>
                      <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not([value=''])]:-top-2 peer-[:not([value=''])]:left-2 peer-[:not([value=''])]:text-xs peer-[:not([value=''])]:bg-white peer-[:not([value=''])]:px-1">
                        Category
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder=" "
                        value={newPatient.referredBy || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, referredBy: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                      />
                      <label className="absolute left-3 top-3 text-sm text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                        Referred By
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Submit"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Existing Patient Modal */}
        <Modal
          isOpen={existingPatientModal}
          onClose={() => setExistingPatientModal(false)}
          title="Patient Already Exists"
          size="lg"
          className="mx-4"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="font-semibold">Patient with this phone number already exists:</p>
              <p className="mt-2">
                <strong>Name:</strong> {existingPatient?.fullName || existingPatient?.name}<br />
                <strong>Phone:</strong> {existingPatient?.phoneNumber || existingPatient?.phone}<br />
                <strong>UID:</strong> {existingPatient?.uid}
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700">What would you like to do?</p>
              
              <button
                onClick={handleAddToExisting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                disabled={isSubmitting}
              >
                Add to Existing Patient
              </button>
              
              <button
                onClick={handleAddAsNew}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                disabled={isSubmitting}
              >
                Register as New Patient
              </button>
              
              <button
                onClick={() => setExistingPatientModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Export helper
const exportPatientsCSV = (rows = []) => {
  const headers = ["UID","Name","Phone","Last Visit","Category"];
  const csvRows = [headers.join(",")];
  rows.forEach(r => {
    const vals = [r.uid, r.name, r.phone, r.lastVisit, r.category].map(v => {
      const s = (v ?? '').toString();
      // escape quotes and commas
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    });
    csvRows.push(vals.join(","));
  });
  const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patients_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Lightweight audit logger: best-effort
const auditLog = async (event, details = {}) => {
  try {
    // Attempt to post; ignore if endpoint missing
    await axiosInstance.post('/audit/log', { event, details, ts: new Date().toISOString() });
  } catch {
    // Fallback to console
    console.info('[audit]', event, details);
  }
};

const columns = [
  { label: "UID", accessor: "uid" },
  { label: "Name", accessor: "name" },
  { label: "Phone", accessor: "phone" },
  { label: "Last Visit", accessor: "lastVisit" },
  { label: "Category", accessor: "category" },
  { label: "Action", accessor: "action", disableSort: true },
];

export default CreateRx;