import React, { useState, useEffect, useContext } from "react";
import KPISection from "../components/ui/KpiSection";
import GenericTable from "../components/ui/GenericTable";
import BarGraph from "../components/ui/charts/BarGraph";
import LineGraph from "../components/ui/charts/LineGraph";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import AiModal from "../components/ui/AiModal";
import { BsChatDots } from "react-icons/bs"; 
import { RxCross2 } from "react-icons/rx";
import Loading from "../components/ui/Loading";
import Pagination from "../components/ui/Pagination";

import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext, DoctorNameContext } from '../App';

const columns = [
  { label: "Patient Name", accessor: "name" },
  { label: "Time", accessor: "time" },
  { label: "Type", accessor: "type" },
  { label: "Status", accessor: "status" },
];

const columns2 = [
  { label: "Patient Name", accessor: "name" },
  { label: "Procedure", accessor: "procedure" },
  { label: "Date", accessor: "date" },
  { label: "Status", accessor: "status" },
];

const kpiDefaults = {
  "Total Patients": { icon: "/user.svg", color: "#c7d2fe" },
  "Appointments": { icon: "/calendar.svg", color: "#e9d5ff" },
  "Revenue": { icon: "/revenue.svg", color: "#fbcfe8" }
};

const mapAppointmentToTableRow = (apt) => ({
  name: apt.patientId?.fullName || apt.patientId?.name || '',
  time: apt.time || '',
  type: apt.type || '',
  status: apt.status || (apt.markComplete ? 'Completed' : 'Scheduled'),
});

const mapSurgeryToTableRow = (surg) => ({
  name: surg.name || '',
  procedure: surg.type || '',
  date: surg.date || '',
  status: 'Planned',
});

const Dashboard = () => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [kpis, setKpis] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patientGrowthData, setPatientGrowthData] = useState([]);
  const [appointmentTypeData, setAppointmentTypeData] = useState([]);
  const [plannedSurgeries, setPlannedSurgeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add pagination state and logic for Today's Appointments
  const [currentAppointmentsPage, setCurrentAppointmentsPage] = useState(1);
  const appointmentsRowsPerPage = 7;
  const [appointmentsTotalPages, setAppointmentsTotalPages] = useState(1);
  const [appointmentsPageRows, setAppointmentsPageRows] = useState([]);

  // Add pagination state and logic for Planned Surgeries
  const [currentSurgeriesPage, setCurrentSurgeriesPage] = useState(1);
  const surgeriesRowsPerPage = 7;
  const [surgeriesTotalPages, setSurgeriesTotalPages] = useState(1);
  const [surgeriesPageRows, setSurgeriesPageRows] = useState([]);

  const doctorId = useContext(DoctorIdContext);
  const doctorName = useContext(DoctorNameContext);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    Promise.all([
      axiosInstance.get(`/${doctorId}/report/kpis/${doctorId}`),
      axiosInstance.get(`/${doctorId}/report/patient/12months`),
      axiosInstance.get(`/${doctorId}/report/appointment/types`),
      axiosInstance.get(`/${doctorId}/report/today-appointments?page=${currentAppointmentsPage}&limit=${appointmentsRowsPerPage}`),
      axiosInstance.get(`/${doctorId}/report/planned-surgeries?page=${currentSurgeriesPage}&limit=${surgeriesRowsPerPage}`)
    ])
      .then(([
        kpisRes,
        patientGrowthRes,
        appointmentTypeRes,
        appointmentsRes,
        surgeriesRes
      ]) => {
        setKpis(Array.isArray(kpisRes.data.kpis) ? kpisRes.data.kpis : []);
        // Format patient growth for 12 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const arr = Array.isArray(patientGrowthRes.data.patients) ? patientGrowthRes.data.patients : [];
        const now = new Date();
        setPatientGrowthData(arr.map((v, i) => ({ month: months[(now.getMonth() - 11 + i + 12) % 12], growth: v })));
        // Format appointment types
        const types = Array.isArray(appointmentTypeRes.data.types) ? appointmentTypeRes.data.types : [];
        setAppointmentTypeData(types);
        // Today's Appointments (paginated)
        const appointments = Array.isArray(appointmentsRes.data.appointments) ? appointmentsRes.data.appointments : [];
        setAppointmentsPageRows(appointments.map(mapAppointmentToTableRow));
        setAppointmentsTotalPages(Math.max(1, Math.ceil((appointmentsRes.data.pagination?.total || appointments.length) / appointmentsRowsPerPage)));
        // Planned Surgeries (paginated)
        const surgeries = Array.isArray(surgeriesRes.data.surgeries) ? surgeriesRes.data.surgeries : [];
        setSurgeriesPageRows(surgeries.map(mapSurgeryToTableRow));
        setSurgeriesTotalPages(Math.max(1, Math.ceil((surgeriesRes.data.pagination?.total || surgeries.length) / surgeriesRowsPerPage)));
      })
      .catch(() => {
        setKpis([]);
        setPatientGrowthData([]);
        setAppointmentTypeData([]);
        setAppointmentsPageRows([]);
        setAppointmentsTotalPages(1);
        setSurgeriesPageRows([]);
        setSurgeriesTotalPages(1);
        setError("Failed to fetch dashboard data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId, currentAppointmentsPage, currentSurgeriesPage]);

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
        <main className="flex-1 p-2 bg-white overflow-y-auto relative">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="flex flex-row justify-between mb-8">
              <div>
                <h1 className="text-3xl leading-10 font-bold mb-2">Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, Dr. {doctorName || 'Doctor'}
                </p>
              </div>
              {/* You can remove this old button if not needed anymore */}
            </div>

            <div className="w-max-lg mx-auto mb-8">
              <KPISection kpis={kpis.map(kpi => ({ ...kpi, ...kpiDefaults[kpi.label] }))} />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Today's Appointments</h2>
              <GenericTable columns={columns} data={appointmentsPageRows} />
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentAppointmentsPage}
                  totalPages={appointmentsTotalPages}
                  onPageChange={setCurrentAppointmentsPage}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-xl">
                <h3 className="text-sm font-medium mb-3">Patient Growth</h3>
                {patientGrowthData.length > 0 ? (
                  <LineGraph data={patientGrowthData} />
                ) : (
                  <div className="text-center text-gray-400 py-8">No data available</div>
                )}
              </div>
              <div className="p-4 border rounded-xl">
                <h3 className="text-sm font-medium mb-3">Appointment Types</h3>
                {appointmentTypeData.length > 0 ? (
                  <BarGraph data={appointmentTypeData} />
                ) : (
                  <div className="text-center text-gray-400 py-8">No data available</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Planned Surgeries</h2>
              <GenericTable columns={columns2} data={surgeriesPageRows} />
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentSurgeriesPage}
                  totalPages={surgeriesTotalPages}
                  onPageChange={setCurrentSurgeriesPage}
                />
              </div>
            </div>
          </div>

          {/* Floating Chat Button */}
          <div className="fixed bottom-4 right-6 z-50">
            <button
              onClick={() => setShowAiModal(!showAiModal)}
              className="w-14 h-14  rounded-full bg-[#7047D1] shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
            >
              {showAiModal ? (
                <RxCross2 size={24} />
              ) : (
               <BsChatDots size={24} className="text-white"/>
              )}
            </button>
          </div>

          {/* AI Modal */}
          {showAiModal && <AiModal onClose={() => setShowAiModal(false)} />}
          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
