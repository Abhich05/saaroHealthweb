import React, { useState, useEffect, useContext, useRef } from "react";

import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import { FiSearch } from "react-icons/fi";
import axiosInstance from '../api/axiosInstance';
import { cacheGet, cacheSet, isTransientError, makeCacheKey, sleep } from "../utils/fetchUtils";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Modal from "../components/ui/GenericModal";
import SearchBar from "../components/ui/SearchBar";
import Pagination from "../components/ui/Pagination";
import { toast } from "react-toastify";
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";

const columns = [
  { label: "Record ID", accessor: "id" },
  { label: "Patient Name", accessor: "name" },
  { label: "Admission Date", accessor: "admissionDate" },
  { label: "Discharge Date", accessor: "dischargeDate" },
  { label: "Status", accessor: "status" },
  { label: "Actions", accessor: "action" },
];

const IPDRecords = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]); // Start empty, fetch from backend
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({ page: 1, limit: 7, totalFiles: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;
  const doctorId = useContext(DoctorIdContext);

  // Refs for lifecycle/cancellation
  const isMountedRef = useRef(false);
  const requestCtrlRef = useRef(null);
  const mountedAtRef = useRef(Date.now());

  // 1. Add state for all patients, selected patient, and modal fields
  const [modalFields, setModalFields] = useState({
    name: '',
    age: '',
    gender: '',
    phoneNumber: '',
    admissionDate: '',
    dischargeDate: '',
    status: 'Admitted',
  });
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Efficiently fetch all IPD records and join with patient info
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; try { requestCtrlRef.current?.abort(); } catch {} };
  }, []);

  const mapFileToRow = (file) => {
    let patient = file.patientId;
    if (patient && typeof patient === 'object' && patient.fullName) {
      return {
        id: file._id,
        name: patient.fullName,
        age: patient.age || '',
        gender: patient.gender || '',
        phoneNumber: patient.phoneNumber || '',
        admissionDate: file.admissionDate || (file.createdAt ? file.createdAt.slice(0, 10) : ''),
        dischargeDate: file.dischargeDate || (file.updatedAt ? file.updatedAt.slice(0, 10) : ''),
        status: file.status || 'Admitted',
        action: 'View / Edit Details',
        fileUrl: file.fileUrl,
        patientId: patient._id,
        ...file
      };
    } else {
      return {
        id: file._id,
        name: 'Unknown',
        age: '',
        gender: '',
        phoneNumber: '',
        admissionDate: file.admissionDate || (file.createdAt ? file.createdAt.slice(0, 10) : ''),
        dischargeDate: file.dischargeDate || (file.updatedAt ? file.updatedAt.slice(0, 10) : ''),
        status: file.status || 'Admitted',
        action: 'View / Edit Details',
        fileUrl: file.fileUrl,
        patientId: file.patientId,
        ...file
      };
    }
  };

  const fetchRecords = async (attempt = 0) => {
    if (!doctorId) return;
    // cancel previous
    if (requestCtrlRef.current) { try { requestCtrlRef.current.abort(); } catch {} }
    const controller = new AbortController();
    requestCtrlRef.current = controller;
    const abortId = setTimeout(() => { try { controller.abort(); } catch {} }, 8000);

    if (isMountedRef.current) {
      setLoading(true);
      if (Date.now() - mountedAtRef.current > 800) setError("");
    }

    try {
      const params = { doctorId, page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.searchQuery = searchTerm;
      const cacheKey = makeCacheKey('ipd', [doctorId, params.page, params.limit, params.searchQuery || '']);
      const cached = cacheGet(cacheKey);
      if (cached && records.length === 0) {
        if (!isMountedRef.current) return;
        setRecords(cached.files.map(mapFileToRow));
        setPagination(prev => ({ ...prev, totalFiles: cached.total || cached.files.length }));
        setLoading(false);
      }

      const res = await axiosInstance.get(`/fileUploader/ipd-all`, { params, signal: controller.signal });
      const files = Array.isArray(res.data.files) ? res.data.files : [];
      if (!isMountedRef.current) return;
      setRecords(files.map(mapFileToRow));
      setPagination(prev => ({ ...prev, totalFiles: res.data.pagination?.totalFiles || files.length }));
      cacheSet(cacheKey, { files, total: res.data.pagination?.totalFiles || files.length, ts: Date.now() });
    } catch (err) {
      const isAbort = err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || /aborted|canceled/i.test(err?.message || '');
      if (isAbort) return; // silent
      if (isTransientError(err) && attempt < 2) {
        await sleep(300 * Math.pow(2, attempt));
        return fetchRecords(attempt + 1);
      }
      if (isMountedRef.current) setError('Failed to fetch IPD records. Please try again.');
    } finally {
      clearTimeout(abortId);
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, pagination.page, pagination.limit, searchTerm]);

  const filteredData = records.filter(
    (row) =>
      String(row.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(row.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil((pagination.totalFiles || records.length) / pagination.limit));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, records]);

  // Remove full page loading: show inline error banner instead

  // 4. Enable 'Create Discharge Summary' only if a patient is selected
  const handleCreateDischargeSummary = () => {
    navigate('/ipd/discharge');
  };

  // 5. On save in modal: create or edit
  const handleSave = async () => {
    if (isCreateMode) {
      // Create new IPD record (optionally, you may want to create a patient first if needed)
      const formData = new FormData();
      formData.append('fileType', 'ipd');
      formData.append('name', modalFields.name);
      formData.append('age', modalFields.age);
      formData.append('gender', modalFields.gender);
      formData.append('phoneNumber', modalFields.phoneNumber);
      formData.append('admissionDate', modalFields.admissionDate);
      formData.append('dischargeDate', modalFields.dischargeDate);
      formData.append('status', modalFields.status);
      // Optionally, add a dummy file or require file upload
      // formData.append('file', ...);
      try {
        await axiosInstance.post(`/fileUploader/upload/new`, formData);
        toast.success('IPD record created');
        setIsModalOpen(false);
        fetchRecords();
      } catch {
        toast.error('Failed to create IPD record');
      }
    } else {
      // Edit existing IPD record
      try {
        await axiosInstance.patch(`/fileUploader/ipd/${modalFields.id}`, {
          admissionDate: modalFields.admissionDate,
          dischargeDate: modalFields.dischargeDate,
          status: modalFields.status,
        });
        toast.success('IPD record updated');
        setIsModalOpen(false);
        fetchRecords();
      } catch {
        toast.error('Failed to update IPD record');
      }
    }
  };

  // 6. On 'View/Edit Details', open modal in edit mode
  const handleViewEdit = (record) => {
    setModalFields(record);
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-5">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl leading-10 font-semibold mb-0">IPD Records</h1>
              {/* 4. Enable 'Create Discharge Summary' only if a patient is selected */}
              <Button
                onClick={handleCreateDischargeSummary}
                className="bg-[#7042D9] text-[#120F1A] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#dcd6f2] transition-colors"
              >
                Create Discharge Summary
              </Button>
            </div>

            <p className="text-sm text-gray-500  mb-4">
              View and manage patient records, including medical history, treatments, and outcomes.
            </p>

            {error ? (
              <div className="bg-red-100 text-red-700 p-3 rounded border border-red-200">
                {error}
              </div>
            ) : null}

            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Search by Patient name or record ID"
            />

            <GenericTable
              columns={columns}
              data={records}
              loading={loading}
              loadingRows={8}
              renderCell={(row, accessor) => {
                const content = (() => {
                  if (accessor === "status") {
                    return (
                      <span className="text-gray-700 text-sm px-3 py-1 rounded-full">
                        {row.status}
                      </span>
                    );
                  }

                  if (accessor === "action") {
                    return (
                      <button
                        className="text-[#7c69a7] text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/ipd/discharge', { state: { record: row } });
                        }}
                      >
                        View / Edit Details
                      </button>
                    );
                  }

                  if (accessor === "name") {
                    return <span className="text-sm">{row[accessor]}</span>;
                  }

                  return <span className="text-sm text-[#7c69a7]">{row[accessor]}</span>;
                })();

                return (
                  <div
                    onClick={() => {
                      setSelectedRecord(row);
                      setSearchTerm(row.name);
                    }}
                    className="w-full h-full cursor-pointer"
                  >
                    {content}
                  </div>
                );
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
      </div>

      {isModalOpen && modalFields && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="View / Edit Details"
        >
          <div className="space-y-3 max-w-xl">
            <div>
              <label className="block text-sm font-medium">Patient Name</label>
              <input
                type="text"
                value={modalFields.name}
                onChange={(e) =>
                  setModalFields({ ...modalFields, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Age</label>
              <input
                type="text"
                value={modalFields.age}
                onChange={(e) =>
                  setModalFields({ ...modalFields, age: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Gender</label>
              <input
                type="text"
                value={modalFields.gender}
                onChange={(e) =>
                  setModalFields({ ...modalFields, gender: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="text"
                value={modalFields.phoneNumber}
                onChange={(e) =>
                  setModalFields({ ...modalFields, phoneNumber: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Admission Date</label>
              <input
                type="date"
                value={modalFields.admissionDate}
                onChange={(e) =>
                  setModalFields({ ...modalFields, admissionDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Discharge Date</label>
              <input
                type="date"
                value={modalFields.dischargeDate}
                onChange={(e) =>
                  setModalFields({ ...modalFields, dischargeDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                value={modalFields.status}
                onChange={(e) =>
                  setModalFields({ ...modalFields, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#5e3bea] text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IPDRecords;

{/*{isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">View / Edit Details</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Patient Name</label>
                <input
                  type="text"
                  value={selectedRecord.name}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Admission Date</label>
                <input
                  type="date"
                  value={selectedRecord.admissionDate}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, admissionDate: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Discharge Date</label>
                <input
                  type="date"
                  value={selectedRecord.dischargeDate}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, dischargeDate: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={selectedRecord.status}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, status: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#5e3bea] text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )} */}