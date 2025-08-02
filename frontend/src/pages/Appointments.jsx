import React, { useState, useEffect, useContext } from "react";
import { FiPlus } from "react-icons/fi";
import StatBox2 from "../components/ui/StatBox2";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button"
import Modal from "../components/ui/GenericModal";
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";

const AppointmentsDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    mode: "Online",
    location: "Clinic A",
    date: "2025-07-05",
    time: "8:00 AM",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    mode: "Online",
    location: "Clinic A",
    date: "2025-07-05",
    time: "8:00 AM",
  });

  const doctorId = useContext(DoctorIdContext);

  // --- FIX: Define stats for StatBox2 ---
  const stats = [
    {
      label: "Total Appointments",
      value: appointments.length,
    },
    {
      label: "Upcoming",
      value: 0, // Replace with real logic if available
    },
    {
      label: "Completed",
      value: 0, // Replace with real logic if available
    },
  ];

  // Helper to map appointment data for display
  const mapAppointmentToDisplay = (apt) => {
    // If appointment is nested (e.g., apt.appointmentId), flatten it
    const a = apt.appointmentId ? apt.appointmentId : apt;
    
    // Get patient data from populated patientId field
    const patientData = a.patientId || {};
    
    // Debug log to see the data structure
    console.log('Raw appointment data:', apt);
    console.log('Patient data:', patientData);
    
    return {
      id: a._id || a.id || '',
      name: patientData.fullName || patientData.name || a.name || '',
      time: a.time || '',
      date: a.date || '',
      location: a.location || '',
      type: a.type || '',
      phoneNumber: patientData.phoneNumber || a.phoneNumber || '',
    };
  };

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/appointment/${doctorId}/get-upcoming-appointments`)
      .then(res => {
        const appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
        setAppointments(appointments.map(mapAppointmentToDisplay));
      })
      .catch(() => {
        setAppointments([]);
        setError("Failed to fetch appointments. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPatientDropdown && !event.target.closest('.patient-dropdown')) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPatientDropdown]);

  // Close dropdown when there's an error
  useEffect(() => {
    if (error) {
      setShowPatientDropdown(false);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchPatients = async () => {
    if (!doctorId || patientsLoading) return;
    setPatientsLoading(true);
    try {
      const res = await axiosInstance.get(`/patient/get-all/${doctorId}?limit=100`);
      const patientsData = Array.isArray(res.data.patient) ? res.data.patient : [];
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    try {
      const patientData = patient.patientId || patient;
      const patientName = patientData.fullName || patientData.name || "";
      const patientPhone = patientData.phoneNumber || "";
      
      setFormData(prev => ({
        ...prev,
        name: patientName,
        phone: patientPhone,
      }));
      setPatientSearchTerm(patientName);
      setShowPatientDropdown(false);
    } catch (error) {
      console.error('Error selecting patient:', error);
      setShowPatientDropdown(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    try {
      const patientData = patient.patientId || patient;
      const name = patientData.fullName || patientData.name || "";
      const phone = patientData.phoneNumber || "";
      const searchLower = patientSearchTerm.toLowerCase();
      return name.toLowerCase().includes(searchLower) || phone.includes(searchLower);
    } catch (error) {
      console.error('Error filtering patient:', error);
      return false;
    }
  });

  const handleDetailClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (appointment) => {
    console.log('Edit appointment data:', appointment); // Debug log
    setSelectedAppointment(appointment);
    
    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return "2025-07-05";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setEditFormData({
      name: appointment.name || "",
      phone: appointment.phoneNumber || "",
      mode: appointment.type || "Online",
      location: appointment.location || "Clinic A",
      date: formatDateForInput(appointment.date),
      time: appointment.time || "8:00 AM",
    });
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateAppointment = () => {
    if (!doctorId || !selectedAppointment) return;
    setLoading(true);
    setError("");
    
    const payload = {
      name: editFormData.name,
      phoneNumber: String(editFormData.phone),
      location: editFormData.location,
      date: editFormData.date,
      time: editFormData.time,
      type: editFormData.mode || "Follow-up",
    };

    axiosInstance.put(`/appointment/${doctorId}/${selectedAppointment.id}`, payload)
      .then(() => {
        // Refresh appointments list
        axiosInstance.get(`/appointment/${doctorId}/get-upcoming-appointments`)
          .then(res => {
            const appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
            setAppointments(appointments.map(mapAppointmentToDisplay));
          })
          .catch(() => {
            setAppointments([]);
            setError("Failed to fetch appointments after updating.");
          });
        setIsEditModalOpen(false);
        setSelectedAppointment(null);
      })
      .catch((err) => {
        let msg = 'Failed to update appointment';
        if (err.response?.data) {
          if (typeof err.response.data === 'string') {
            msg = err.response.data;
          } else if (err.response.data.error) {
            msg = Array.isArray(err.response.data.error)
              ? err.response.data.error.map(e => e.message).join(', ')
              : err.response.data.error;
          } else if (err.response.data.data) {
            msg = err.response.data.data;
          }
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleAddAppointment = () => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    const payload = {
      name: formData.name,
      phoneNumber: String(formData.phone),
      location: formData.location,
      date: formData.date,
      time: formData.time,
      type: formData.mode || "Follow-up",
    };
    
    // Reset form and close dropdown after successful appointment creation
    setFormData({
      name: "",
      phone: "",
      mode: "Online",
      location: "Clinic A",
      date: "2025-07-05",
      time: "8:00 AM",
    });
    setPatientSearchTerm("");
    setShowPatientDropdown(false);
    
    axiosInstance.post(`/appointment/${doctorId}`, payload)
      .then(() => {
        axiosInstance.get(`/appointment/${doctorId}/get-upcoming-appointments`)
          .then(res => {
            const appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
            setAppointments(appointments.map(mapAppointmentToDisplay));
          })
          .catch(() => {
            setAppointments([]);
            setError("Failed to fetch appointments after adding.");
          });
        setFormData({
          name: "",
          phone: "",
          mode: "Online",
          location: "Clinic A",
          date: "2025-07-05",
          time: "8:00 AM",
        });
        setIsModalOpen(false);
      })
      .catch((err) => {
        let msg = 'Failed to add appointment';
        if (err.response?.data) {
          if (typeof err.response.data === 'string') {
            msg = err.response.data;
          } else if (err.response.data.error) {
            msg = Array.isArray(err.response.data.error)
              ? err.response.data.error.map(e => e.message).join(', ')
              : err.response.data.error;
          } else if (err.response.data.data) {
            msg = err.response.data.data;
          }
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  // Calculate tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

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
            <div className="flex gap-8 w-full">
              {/* Left Section */}
              <div className="w-2/3">
                <h1 className="text-3xl leading-10 font-semibold mb-4">Appointments</h1>
                <h2 className="text-lg text-700 font-semibold mb-2">Latest Appointments</h2>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  {loading ? (
                    // Loading skeleton for appointments
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                      </div>
                    ))
                  ) : (
                    <>
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex justify-between items-center hover:bg-gray-100 p-2 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={`/${apt.name}.png`}
                              onError={(e) => (e.currentTarget.src = "/Sophia Carter.png")}
                              alt="avatar"
                              className="rounded-full w-10 h-10"
                            />
                            <div>
                              <p className="font-medium">{apt.name}</p>
                              <p className="text-sm text-gray-500">{apt.time}</p>
                            </div>
                          </div>
                                                     <Button 
                             className="text-gray-800 px-4 py-1 rounded-full text-sm"
                             onClick={() => handleDetailClick(apt)}
                           >
                             Detail
                           </Button>
                        </div>
                      ))}
                      {appointments.length === 0 && (
                        <div className="text-center text-gray-500 py-8">Data Not Found</div>
                      )}
                    </>
                  )}
                </div>

                <Button
                  className="mt-6 bg-[#7042D9] hover:bg-purple-600 text-white px-5 py-2 rounded-full flex items-center gap-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FiPlus /> Add Appointment
                </Button>
              </div>

              {/* Right Sidebar */}
              <div className="w-1/3 space-y-6">
                <div>
                  <h2 className="text-lg text-700 font-semibold mb-3">Appointment Stats Overview</h2>
                  {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded w-12"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <StatBox2 stats={stats} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2">Share Booking Link</h2>
                  <img
                    src="qr.png"
                    alt="QR Code"
                    className="rounded-xl w-[328px] h-[276px]"
                  />
                  <div className="flex justify-between items-center  mt-3">
                    <Button className="text-700 text-sm text-[#120F1A] px-3 py-1 rounded-full">
                      Copy Link
                    </Button>
                    <Button className="text-700 text-[#120F1A] text-sm px-3 py-1 rounded-full">
                      Share on WhatsApp
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-md font-semibold mb-1">Patients by Type</h2>
                  <p className="text-sm text-gray-700">Patient Types</p>
                  <p className="text-2xl font-bold">480 Total Patients</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Appointment"
        >
          <form className="space-y-4 max-w-xl">
            {/* Patient Search Dropdown */}
            <div className="relative patient-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Registered Patient
              </label>
              <input
                type="text"
                value={patientSearchTerm}
                onChange={(e) => {
                  setPatientSearchTerm(e.target.value);
                  setShowPatientDropdown(true);
                }}
                onFocus={() => {
                  setShowPatientDropdown(true);
                  if (patients.length === 0) {
                    fetchPatients();
                  }
                }}
                placeholder="Search by name or phone number..."
                className="w-full px-3 py-2 border rounded"
              />
                             {showPatientDropdown && isModalOpen && (
                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                   {patientsLoading ? (
                     <div className="p-3 text-gray-500">Loading patients...</div>
                   ) : filteredPatients.length > 0 ? (
                     filteredPatients.map((patient, index) => {
                       try {
                         const patientData = patient.patientId || patient;
                         const patientName = patientData.fullName || patientData.name || "Unknown";
                         const patientPhone = patientData.phoneNumber || "No phone";
                         
                         return (
                           <div
                             key={patient._id || `patient-${index}`}
                             onClick={() => handlePatientSelect(patient)}
                             className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                           >
                             <div className="font-medium">{patientName}</div>
                             <div className="text-sm text-gray-600">{patientPhone}</div>
                           </div>
                         );
                       } catch (error) {
                         console.error('Error rendering patient item:', error);
                         return null;
                       }
                     }).filter(Boolean)
                   ) : (
                     <div className="p-3 text-gray-500">
                       No patients found. You can manually enter details below.
                     </div>
                   )}
                 </div>
               )}
            </div>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <div className="relative">
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded appearance-none"
              >
                <option>Online</option>
                <option>Offline</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ▼
              </div>
            </div>

            <div className="relative">
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded appearance-none"
              >
                <option>Clinic A</option>
                <option>Clinic B</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ▼
              </div>
            </div>

            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={tomorrow}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ▼
              </div>
            </div>

            <div className="relative">
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded appearance-none"
              >
                {["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"].map((t, i) => (
                  <option key={i}>{t}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ▼
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAppointment}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Confirm & Book
              </button>
            </div>
          </form>
                 </Modal>

         {/* Appointment Detail Modal */}
         <Modal
           isOpen={isDetailModalOpen}
           onClose={() => setIsDetailModalOpen(false)}
           title="Appointment Details"
         >
           {selectedAppointment && (
             <div className="space-y-6 max-w-xl">
                                               {/* Patient Information */}
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Information</h3>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Name:</span>
                       <span className="font-medium">{selectedAppointment.name || "Not available"}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Phone:</span>
                       <span className="font-medium">{selectedAppointment.phoneNumber || "Not available"}</span>
                     </div>
                   </div>
                 </div>

               {/* Appointment Timing */}
               <div className="bg-blue-50 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold text-blue-800 mb-3">Appointment Timing</h3>
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span className="text-blue-600">Date:</span>
                     <span className="font-medium">{selectedAppointment.date}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-blue-600">Time:</span>
                     <span className="font-medium">{selectedAppointment.time}</span>
                   </div>
                 </div>
               </div>

               {/* Appointment Details */}
               <div className="bg-green-50 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold text-green-800 mb-3">Appointment Details</h3>
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span className="text-green-600">Type:</span>
                     <span className="font-medium">{selectedAppointment.type}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-green-600">Location:</span>
                     <span className="font-medium">{selectedAppointment.location}</span>
                   </div>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end gap-4 pt-4 border-t">
                 <button
                   type="button"
                   onClick={() => setIsDetailModalOpen(false)}
                   className="text-gray-600 hover:text-black px-4 py-2 rounded"
                 >
                   Close
                 </button>
                                   <button
                    type="button"
                    onClick={() => handleEditClick(selectedAppointment)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit Appointment
                  </button>
               </div>
             </div>
           )}
                   </Modal>

          {/* Edit Appointment Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Appointment"
          >
            <form className="space-y-4 max-w-xl">
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                placeholder="Full Name"
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="tel"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border rounded"
                required
              />
              <div className="relative">
                <select
                  name="mode"
                  value={editFormData.mode}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded appearance-none"
                >
                  <option>Online</option>
                  <option>Offline</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ▼
                </div>
              </div>

              <div className="relative">
                <select
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded appearance-none"
                >
                  <option>Clinic A</option>
                  <option>Clinic B</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ▼
                </div>
              </div>

              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  min={tomorrow}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ▼
                </div>
              </div>

              <div className="relative">
                <select
                  name="time"
                  value={editFormData.time}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded appearance-none"
                >
                  {["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"].map((t, i) => (
                    <option key={i}>{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ▼
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateAppointment}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Appointment
                </button>
              </div>
            </form>
          </Modal>

        </div>
      </div>
    );
  };

export default AppointmentsDashboard;