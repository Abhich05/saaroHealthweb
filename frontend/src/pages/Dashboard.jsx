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
  "Messages": { icon: "/messages.svg", color: "#fbcfe8" }
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
  const [error, setError] = useState("");

  // Granular loading states
  const [kpisLoading, setKpisLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [surgeriesLoading, setSurgeriesLoading] = useState(true);
  const [graphsLoading, setGraphsLoading] = useState(true);

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
    setError("");

    // Load KPIs
    const loadKPIs = async () => {
      setKpisLoading(true);
      try {
        const res = await axiosInstance.get(`/${doctorId}/report/kpis/${doctorId}`);
        const kpisData = Array.isArray(res.data.kpis) ? res.data.kpis : [];
        setKpis(kpisData);
      } catch (error) {
        console.error('Error loading KPIs:', error);
        setKpis([]);
      } finally {
        setKpisLoading(false);
      }
    };

    // Load graphs data
    const loadGraphsData = async () => {
      setGraphsLoading(true);
      try {
        const [patientGrowthRes, appointmentTypeRes] = await Promise.all([
          axiosInstance.get(`/${doctorId}/report/patient/12months`),
          axiosInstance.get(`/${doctorId}/report/appointment/types`)
        ]);
        
        // Format patient growth for 12 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const arr = Array.isArray(patientGrowthRes.data.patients) ? patientGrowthRes.data.patients : [];
        const now = new Date();
        setPatientGrowthData(arr.map((v, i) => ({ month: months[(now.getMonth() - 11 + i + 12) % 12], growth: v })));
        
        // Format appointment types
        const types = Array.isArray(appointmentTypeRes.data.types) ? appointmentTypeRes.data.types : [];
        setAppointmentTypeData(types);
      } catch (error) {
        console.error('Error loading graphs data:', error);
        setPatientGrowthData([]);
        setAppointmentTypeData([]);
      } finally {
        setGraphsLoading(false);
      }
    };

    // Load appointments
    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const res = await axiosInstance.get(`/${doctorId}/report/today-appointments?page=${currentAppointmentsPage}&limit=${appointmentsRowsPerPage}`);
        const appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
        setAppointmentsPageRows(appointments.map(mapAppointmentToTableRow));
        setAppointmentsTotalPages(Math.max(1, Math.ceil((res.data.pagination?.total || appointments.length) / appointmentsRowsPerPage)));
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointmentsPageRows([]);
        setAppointmentsTotalPages(1);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    // Load surgeries
    const loadSurgeries = async () => {
      setSurgeriesLoading(true);
      try {
        const res = await axiosInstance.get(`/${doctorId}/report/planned-surgeries?page=${currentSurgeriesPage}&limit=${surgeriesRowsPerPage}`);
        const surgeries = Array.isArray(res.data.surgeries) ? res.data.surgeries : [];
        setSurgeriesPageRows(surgeries.map(mapSurgeryToTableRow));
        setSurgeriesTotalPages(Math.max(1, Math.ceil((res.data.pagination?.total || surgeries.length) / surgeriesRowsPerPage)));
      } catch (error) {
        console.error('Error loading surgeries:', error);
        setSurgeriesPageRows([]);
        setSurgeriesTotalPages(1);
      } finally {
        setSurgeriesLoading(false);
      }
    };

    // Load all data
    loadKPIs();
    loadGraphsData();
    loadAppointments();
    loadSurgeries();
  }, [doctorId, currentAppointmentsPage, currentSurgeriesPage]);

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
              <KPISection 
                kpis={kpis.map(kpi => ({ ...kpi, ...kpiDefaults[kpi.label] }))} 
                loading={kpisLoading}
                loadingCount={3}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Today's Appointments</h2>
              <GenericTable 
                columns={columns} 
                data={appointmentsPageRows} 
                loading={appointmentsLoading}
                loadingRows={5}
              />
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
                <LineGraph data={patientGrowthData} loading={graphsLoading} />
              </div>
              <div className="p-4 border rounded-xl">
                <h3 className="text-sm font-medium mb-3">Appointment Types</h3>
                <BarGraph data={appointmentTypeData} loading={graphsLoading} />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Planned Surgeries</h2>
              <GenericTable 
                columns={columns2} 
                data={surgeriesPageRows} 
                loading={surgeriesLoading}
                loadingRows={5}
              />
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
