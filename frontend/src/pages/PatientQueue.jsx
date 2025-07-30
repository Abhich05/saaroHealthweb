import React, { useState, useEffect, useContext } from "react";
import TabHeader from "../components/ui/TabHeader";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import GenericTable from "../components/ui/GenericTable";
import StatBox from "../components/ui/StatBox";
import { FiSearch } from "react-icons/fi";
import SearchBar from '../components/ui/SearchBar';
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';
import Pagination from '../components/ui/Pagination';
import Loading from "../components/ui/Loading";

const columns = [
    { label: "Token", accessor: "token" },
    { label: "Patient Name", accessor: "name" },
    { label: "Age/Gender", accessor: "ageGender" },
    { label: "Type", accessor: "type" },
    { label: "Time", accessor: "time" },
    { label: "Status", accessor: "status" },
    { label: "Actions", accessor: "actions" },
];

const PatientQueue = () => {
    const [activeTabId, setActiveTabId] = useState("Today");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 7;
    const [queueData, setQueueData] = useState({ Today: [], Tomorrow: [], Upcoming: [] });
    const doctorId = useContext(DoctorIdContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({ Today: { total: 0, page: 1, limit: rowsPerPage }, Tomorrow: { total: 0, page: 1, limit: rowsPerPage }, Upcoming: { total: 0, page: 1, limit: rowsPerPage } });

    const tabOptions = [
        { id: "Today", label: "Today" },
        { id: "Tomorrow", label: "Tomorrow" },
        { id: "Upcoming", label: "Upcoming" },
    ];

    useEffect(() => {
        if (!doctorId) return;
        setLoading(true);
        setError("");
        axiosInstance.get(`/doctor/${doctorId}/patient-queue?todayPage=${pagination.Today.page}&todayLimit=${pagination.Today.limit}&tomorrowPage=${pagination.Tomorrow.page}&tomorrowLimit=${pagination.Tomorrow.limit}&upcomingPage=${pagination.Upcoming.page}&upcomingLimit=${pagination.Upcoming.limit}&searchQuery=${encodeURIComponent(searchTerm)}`)
            .then(res => {
                setQueueData(res.data && typeof res.data === 'object' ? res.data : { Today: [], Tomorrow: [], Upcoming: [] });
                setPagination(prev => ({
                  Today: res.data.pagination?.Today || prev.Today,
                  Tomorrow: res.data.pagination?.Tomorrow || prev.Tomorrow,
                  Upcoming: res.data.pagination?.Upcoming || prev.Upcoming,
                }));
            })
            .catch(() => {
                setQueueData({ Today: [], Tomorrow: [], Upcoming: [] });
                setError("Failed to fetch patient queue. Please try again.");
            })
            .finally(() => setLoading(false));
    }, [doctorId, pagination.Today.page, pagination.Tomorrow.page, pagination.Upcoming.page, searchTerm, activeTabId]);

    const currentData = queueData[activeTabId] || [];

    const filteredData = currentData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.max(1, Math.ceil((pagination[activeTabId]?.total || currentData.length) / (pagination[activeTabId]?.limit || rowsPerPage)));

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTabId, searchTerm]);

    useEffect(() => {
  setPagination(prev => ({
    ...prev,
    [activeTabId]: { ...prev[activeTabId], page: 1 }
  }));
}, [searchTerm, activeTabId]);

    const stats = [
        {
            label: "Total Patients",
            value: Object.values(queueData).flat().length,
        },
        {
            label: "Waiting",
            value: Object.values(queueData).flat().filter((p) => p.status === "Waiting").length,
        },
        {
            label: "In Consultation",
            value: Object.values(queueData).flat().filter((p) => p.status === "In Consultation").length,
        },
        {
            label: "Completed",
            value: Object.values(queueData).flat().filter((p) => p.status === "Completed").length,
        },
    ];

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
                <main className="flex-1 p-2 bg-white overflow-y-auto relative">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
                        <h1 className="text-3xl leading-10 font-semibold mb-4">Patient Queue</h1>
                        <div className="w-full lg:w-100 mt-6 lg:mt-0 space-y-4">
                            <h1 className="text-lg font-semibold">Quick Stats</h1>
                            <StatBox stats={stats} />
                        </div>
                        <div className="flex justify-start w-max mb-4 ml-0">
                            <TabHeader
                                tabs={tabOptions}
                                activeTabId={activeTabId}
                                setActiveTabId={setActiveTabId}
                            />
                        </div>

                        <div className="flex flex-col lg:flex-row lg:space-x-8">
                            <div className="flex-1">
                                <SearchBar
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  placeholder="Search Name"
/>
                                <h2 className="text-lg font-semibold mb-2">{`${activeTabId} Queue`}</h2>
                                <div className="overflow-x-auto">
                                    <GenericTable
                                        columns={columns}
                                        data={currentData}
                                        loading={loading}
                                        loadingRows={8}
                                        renderCell={(row, accessor) => {
                                            if (accessor === "status") {
                                                return <span className="bg-[green-100] px-2 py-1 rounded">{row[accessor]}</span>;
                                            }
                                            return <span className="text-sm">{row[accessor]}</span>;
                                        }}
                                    />
                                </div>
                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        currentPage={pagination[activeTabId]?.page || 1}
                                        totalPages={totalPages}
                                        onPageChange={page => setPagination(prev => ({ ...prev, [activeTabId]: { ...prev[activeTabId], page } }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PatientQueue;
