import React, { useState, useEffect, useContext, useMemo } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import KPISection from "../components/ui/KpiSection";
import GenericTable from "../components/ui/GenericTable";
import Modal from '../components/ui/GenericModal';
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";
import { FiSearch, FiFilter, FiPrinter } from "react-icons/fi";
import { toast } from 'react-toastify';
import { printInvoice } from '../utils/printInvoice';

const columns = [
  { label: "Invoice ID", accessor: "id" },
  { label: "Patient Name", accessor: "name" },
  { label: "Date of Invoice", accessor: "date" },
  { label: "Amount (₹)", accessor: "amount" },
  { label: "Status", accessor: "status" },
  { label: "Payment Mode", accessor: "mode" },
  { label: "Actions", accessor: "action" },
];

const Invoice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);

  const [invoicesData, setInvoicesData] = useState([]);
  const doctorId = useContext(DoctorIdContext);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, statusFilter, dateFilter, modeFilter]);

    useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    
    // Build query parameters
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      searchQuery: searchTerm,
      statusFilter: statusFilter !== "All" ? statusFilter : "",
      dateFilter: dateFilter !== "All" ? dateFilter : "",
      modeFilter: modeFilter !== "All" ? modeFilter : ""
    });
    
    axiosInstance.get(`/${doctorId}/invoice?${params.toString()}`)
      .then(res => {
        const invoices = Array.isArray(res.data.invoices) ? res.data.invoices : [];
        const mapped = invoices.map(inv => ({
          id: inv.invoiceId || inv._id,
          _id: inv._id,
          name: inv.name,
          date: inv.createdAt ? inv.createdAt.slice(0, 10) : '',
          amount: inv.totalAmount,
          status: inv.paymentStatus,
          mode: inv.paymentMode,
        }));
        setInvoicesData(mapped);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination?.total || mapped.length
        }));
      })
      .catch((err) => {
        console.error('Error fetching invoices:', err);
        setInvoicesData([]);
        setPagination(prev => ({ ...prev, total: 0 }));
        setError("Failed to fetch invoices. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId, pagination.page, pagination.limit, searchTerm, statusFilter, dateFilter, modeFilter]);

  const emptyForm = {
    uid: "",
    name: "",
    phone: "",
    paymentStatus: "Billed",
    privateNotes: "",
    services: [{ service: "", qty: 1, amount: 0, discount: 0 }],
    additionalDiscount: "",
    paymentMode: "Cash",
    patientNote: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;

    if (field === "service" && value && index === formData.services.length - 1) {
      updatedServices.push({ service: "", qty: 1, amount: 0, discount: 0 });
    }

    setFormData({ ...formData, services: updatedServices });
  };

  const handleCreateOrUpdateInvoice = () => {
    // Validation
    if (!formData.uid.trim()) {
      toast.error("UID is required");
      return;
    }
    if (formData.uid.trim().length < 3) {
      toast.error("UID should be at least 3 characters long");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formData.name.trim().length < 3) {
      toast.error("Name should be at least 3 characters long");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    
    // Validate services
    const validServices = formData.services.filter(s => s.service.trim() && s.amount > 0);
    if (validServices.length === 0) {
      toast.error("At least one service with amount is required");
      return;
    }

    const total = formData.services.reduce((sum, s) => {
      return sum + (s.qty * s.amount - s.discount);
    }, 0) - parseFloat(formData.additionalDiscount || 0);

    setLoading(true);
    setError("");
         if (isEditing) {
       // Update existing invoice
       const updateUrl = `/${doctorId}/invoice/${editingInvoiceId}`;
       console.log('Updating invoice with URL:', updateUrl);
       console.log('Update data:', {
         name: formData.name,
         uid: formData.uid,
         phone: formData.phone,
         paymentStatus: formData.paymentStatus,
         privateNote: formData.privateNotes,
         items: formData.services.map(s => ({
           service: s.service,
           quantity: s.qty,
           amount: s.amount,
           discount: s.discount,
         })),
         additionalDiscountAmount: parseFloat(formData.additionalDiscount) || 0,
         totalAmount: parseFloat(total) || 0,
         paymentMode: formData.paymentMode,
         patientNote: formData.patientNote,
       });
       
       axiosInstance.put(updateUrl, {
        name: formData.name,
        uid: formData.uid,
        phone: formData.phone,
        paymentStatus: formData.paymentStatus,
        privateNote: formData.privateNotes,
        items: formData.services.map(s => ({
          service: s.service,
          quantity: s.qty,
          amount: s.amount,
          discount: s.discount,
        })),
        additionalDiscountAmount: parseFloat(formData.additionalDiscount) || 0,
        totalAmount: parseFloat(total) || 0,
        paymentMode: formData.paymentMode,
        patientNote: formData.patientNote,
      })
             .then((res) => {
         console.log('Invoice updated successfully:', res.data);
         toast.success("Invoice updated successfully!");
         setPagination(prev => ({ ...prev })); // triggers useEffect to refetch
       })
       .catch((err) => {
         console.error('Update invoice error:', err);
         console.error('Error response:', err.response);
         console.error('Error status:', err.response?.status);
         console.error('Error data:', err.response?.data);
         
         const msg =
           (Array.isArray(err?.response?.data) && err.response.data[0]?.message) ||
           err?.response?.data?.message ||
           err?.message ||
           'Failed to update invoice';
         toast.error(msg);
         setError(msg);
       })
      .finally(() => {
        setLoading(false);
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingInvoiceId(null);
        setFormData(emptyForm);
      });
      return;
    } else {
             axiosInstance.post(`/${doctorId}/invoice`, {
        name: formData.name,
        uid: formData.uid,
        phone: formData.phone,
        paymentStatus: formData.paymentStatus,
        privateNote: formData.privateNotes,
        items: formData.services.map(s => ({
          service: s.service,
          quantity: s.qty,
          amount: s.amount,
          discount: s.discount,
        })),
        additionalDiscountAmount: parseFloat(formData.additionalDiscount) || 0,
        totalAmount: parseFloat(total) || 0,
        paymentMode: formData.paymentMode,
        patientNote: formData.patientNote,
      })
             .then((res) => {
         console.log('Invoice created successfully:', res.data);
         toast.success("Invoice created successfully!");
         setPagination(prev => ({ ...prev })); // triggers useEffect to refetch
       })
       .catch((err) => {
         const msg =
           (Array.isArray(err?.response?.data) && err.response.data[0]?.message) ||
           err?.response?.data?.message ||
           err?.message ||
           'Failed to create invoice';
         toast.error(msg);
         setError(msg);
       })
      .finally(() => {
        setLoading(false);
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingInvoiceId(null);
        setFormData(emptyForm);
      });
    }
  };

  const handlePrintInvoice = async (invoice) => {
    try {
      setLoading(true);
      // Fetch complete invoice data for printing
      const response = await axiosInstance.get(`/${doctorId}/invoice/${invoice._id || invoice.id}/print`);
      const invoiceData = response.data.invoice;
      
      // Mock doctor info - you can replace this with actual doctor data
      const doctorInfo = {
        clinicName: "Medical Clinic",
        phone: "+91 98765 43210",
        email: "clinic@example.com",
        address: "123 Medical Center, City, State - 123456"
      };
      
      printInvoice(invoiceData, doctorInfo);
      toast.success("Invoice print window opened!");
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error("Failed to print invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (invoice) => {
    if (!invoice || (!invoice._id && !invoice.id)) {
      toast.error("Invalid invoice data");
      return;
    }
    
    const invoiceId = invoice._id || invoice.id;
    setIsLoadingInvoice(true);
    setLoadingInvoiceId(invoiceId);
    setError("");
    
    // Fetch complete invoice data from backend
    console.log('Fetching invoice with ID:', invoiceId);
    
    axiosInstance.get(`/${doctorId}/invoice/${invoiceId}`)
      .then(res => {
        console.log('Invoice data received:', res.data);
        const invoiceData = res.data.invoice || res.data; // Handle both response formats
        
        // Ensure we have all the required data
        if (!invoiceData) {
          throw new Error('No invoice data received');
        }
        
        setFormData({
          uid: invoiceData.uid || "",
          name: invoiceData.name || "",
          phone: invoiceData.phone || "",
          paymentStatus: invoiceData.paymentStatus || "Billed",
          privateNotes: invoiceData.privateNote || "",
          services: invoiceData.items && invoiceData.items.length > 0 ? invoiceData.items.map(item => ({
            service: item.service || "",
            qty: item.quantity || 1,
            amount: item.amount || 0,
            discount: item.discount || 0,
          })) : [{ service: "", qty: 1, amount: 0, discount: 0 }],
          additionalDiscount: invoiceData.additionalDiscountAmount || "",
          paymentMode: invoiceData.paymentMode || "Cash",
          patientNote: invoiceData.patientNote || "",
        });
        
        setEditingInvoiceId(invoiceId);
        setIsEditing(true);
        setIsModalOpen(true);
        toast.success("Invoice data loaded successfully!");
      })
       .catch((err) => {
         console.error('Error fetching invoice:', err);
         const msg =
           (Array.isArray(err?.response?.data) && err.response.data[0]?.message) ||
           err?.response?.data?.message ||
           err?.message ||
           'Failed to fetch invoice details';
         toast.error(msg);
         setError(msg);
         
         // Fallback to basic data if fetch fails
         setFormData({
           uid: "",
           name: invoice.name,
           phone: "",
           paymentStatus: invoice.status,
           privateNotes: "",
           services: [{ service: "", qty: 1, amount: invoice.amount, discount: 0 }],
           additionalDiscount: "",
           paymentMode: invoice.mode,
           patientNote: "",
         });
         setEditingInvoiceId(invoiceId);
         setIsEditing(true);
         setIsModalOpen(true);
       })
       .finally(() => {
         setIsLoadingInvoice(false);
         setLoadingInvoiceId(null);
       });
  };

  // Filter invoices based on search term, status filter, date filter, and mode filter
  const filteredInvoices = useMemo(() => {
    let filtered = invoicesData;
    
    // Apply status filter first
    if (statusFilter !== "All") {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== "All") {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        
        switch (dateFilter) {
          case "Today":
            return invoiceDate >= todayStart;
          case "Last 7 days":
            const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return invoiceDate >= sevenDaysAgo;
          case "Last 30 days":
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return invoiceDate >= thirtyDaysAgo;
          case "Last 90 days":
            const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            return invoiceDate >= ninetyDaysAgo;
          case "This month":
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return invoiceDate >= thisMonthStart;
          case "Last month":
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            return invoiceDate >= lastMonthStart && invoiceDate <= lastMonthEnd;
          default:
            return true;
        }
      });
    }
    
    // Apply payment mode filter
    if (modeFilter !== "All") {
      filtered = filtered.filter(invoice => invoice.mode === modeFilter);
    }
    
    // Then apply search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.id.toLowerCase().includes(searchLower) ||
          invoice.name.toLowerCase().includes(searchLower) ||
          invoice.status.toLowerCase().includes(searchLower) ||
          invoice.mode.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [invoicesData, searchTerm, statusFilter, dateFilter, modeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pagination.limit));

  // KPI calculations
  const kpiData = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const invoicesThisMonth = invoicesData.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    
    const totalInvoicesThisMonth = invoicesThisMonth.length;
    const totalRevenue = invoicesData.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    
    // Calculate pending payments (Unbilled + Partially Paid)
    const pendingPayments = invoicesData
      .filter(inv => inv.status && ['Unbilled', 'Partially Paid'].includes(inv.status))
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    
    // Calculate paid amount
    const paidAmount = invoicesData
      .filter(inv => inv.status && inv.status === 'Paid')
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    
    return [
      {
        label: 'Total Invoices This Month',
        value: totalInvoicesThisMonth,
        change: '+10%',
        changeType: 'positive',
        icon: '/invoice.svg',
        color: '#e0e7ff',
      },
      {
        label: 'Total Revenue',
        value: `₹ ${totalRevenue.toLocaleString()}`,
        change: '+5%',
        changeType: 'positive',
        icon: '/revenue.svg',
        color: '#fbcfe8',
      },
      {
        label: 'Paid Amount',
        value: `₹ ${paidAmount.toLocaleString()}`,
        change: '+8%',
        changeType: 'positive',
        icon: '/paid.svg',
        color: '#dcfce7',
      },
    ];
  }, [invoicesData]);

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
                         <div className="flex justify-between items-center mb-6">
                               <div>
                  <h1 className="text-3xl leading-10 font-semibold text-[#322e45]">Invoices</h1>
                  {(statusFilter !== "All" || dateFilter !== "All" || modeFilter !== "All") && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span>Filtered by: </span>
                      {statusFilter !== "All" && (
                        <span className="font-medium text-blue-600 mr-2">{statusFilter}</span>
                      )}
                      {dateFilter !== "All" && (
                        <span className="font-medium text-green-600 mr-2">{dateFilter}</span>
                      )}
                      {modeFilter !== "All" && (
                        <span className="font-medium text-purple-600">{modeFilter}</span>
                      )}
                    </div>
                  )}
                </div>
              <Button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsEditing(false);
                  setFormData(emptyForm);
                }}
                className="px-5 text-sm font-medium shadow"
              >
                + Create Invoice
              </Button>
            </div>
            
                         {/* Status Capsules and Search */}
             <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
               {/* Status Capsules */}
               <div className="flex flex-wrap gap-3">
                                   {(statusFilter !== "All" || dateFilter !== "All" || modeFilter !== "All") && (
                    <div className="text-sm text-gray-600 mb-2 w-full">
                      Showing {filteredInvoices.length} of {invoicesData.length} invoices
                    </div>
                  )}
                <button
                  onClick={() => setStatusFilter("All")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "All"
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  All ({invoicesData.length})
                </button>
                <button
                  onClick={() => setStatusFilter("Billed")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "Billed"
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  Billed ({invoicesData.filter(inv => inv.status === 'Billed').length})
                </button>
                <button
                  onClick={() => setStatusFilter("Unbilled")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "Unbilled"
                      ? "bg-orange-100 text-orange-800 border-2 border-orange-300"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  Unbilled ({invoicesData.filter(inv => inv.status === 'Unbilled').length})
                </button>
                <button
                  onClick={() => setStatusFilter("Partially Paid")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "Partially Paid"
                      ? "bg-red-100 text-red-800 border-2 border-red-300"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  Partially Paid ({invoicesData.filter(inv => inv.status === 'Partially Paid').length})
                </button>
                <button
                  onClick={() => setStatusFilter("Paid")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "Paid"
                      ? "bg-green-100 text-green-800 border-2 border-green-300"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  Paid ({invoicesData.filter(inv => inv.status === 'Paid').length})
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                                                   <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showFilters ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <FiFilter />
                    {showFilters ? 'Hide Filters' : 'Filters'}
                  </button>
                  {(statusFilter !== "All" || dateFilter !== "All" || modeFilter !== "All") && (
                    <button
                      onClick={() => {
                        setStatusFilter("All");
                        setDateFilter("All");
                        setModeFilter("All");
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
              </div>
            </div>
            
                         {/* Additional Filters */}
             {showFilters && (
               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Date Range
                       {dateFilter !== "All" && (
                         <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                           Active
                         </span>
                       )}
                     </label>
                     <select
                       value={dateFilter}
                       onChange={(e) => setDateFilter(e.target.value)}
                       className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                         dateFilter !== "All" ? "border-green-300 bg-green-50" : "border-gray-300"
                       }`}
                     >
                       <option value="All">All Time</option>
                       <option value="Today">Today</option>
                       <option value="Last 7 days">Last 7 days</option>
                       <option value="Last 30 days">Last 30 days</option>
                       <option value="Last 90 days">Last 90 days</option>
                       <option value="This month">This month</option>
                       <option value="Last month">Last month</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Payment Mode
                       {modeFilter !== "All" && (
                         <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                           Active
                         </span>
                       )}
                     </label>
                     <select
                       value={modeFilter}
                       onChange={(e) => setModeFilter(e.target.value)}
                       className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                         modeFilter !== "All" ? "border-purple-300 bg-purple-50" : "border-gray-300"
                       }`}
                     >
                       <option value="All">All Modes</option>
                       <option value="Cash">Cash</option>
                       <option value="Credit Card">Credit Card</option>
                       <option value="UPI">UPI</option>
                       <option value="Online">Online</option>
                     </select>
                   </div>
                 </div>
               </div>
             )}

                         {/* KPIs Section */}
             <div className="w-full mx-auto mb-8">
               <KPISection kpis={kpiData} loading={loading} loadingCount={3} />
             </div>

                         <GenericTable
               columns={columns}
               data={filteredInvoices}
               loading={loading}
               loadingRows={8}
               renderCell={(row, accessor) => {
                 if (accessor === "status") {
                   const statusColors = {
                     'Billed': 'bg-blue-100 text-blue-800',
                     'Unbilled': 'bg-orange-100 text-orange-800',
                     'Partially Paid': 'bg-red-100 text-red-800',
                     'Paid': 'bg-green-100 text-green-800'
                   };
                   return (
                     <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
                       {row.status}
                     </span>
                   );
                 }
                 if (["name", "mode", "date"].includes(accessor)) {
                   const value = row[accessor];
                   if (searchTerm && value.toLowerCase().includes(searchTerm.toLowerCase())) {
                     const parts = value.split(new RegExp(`(${searchTerm})`, 'gi'));
                     return (
                       <span className="text-sm text-[#69598C] px-3 py-1">
                         {parts.map((part, index) => 
                           part.toLowerCase() === searchTerm.toLowerCase() ? 
                             <mark key={index} className="bg-yellow-200 rounded px-1">{part}</mark> : 
                             part
                         )}
                       </span>
                     );
                   }
                   return <span className="text-sm text-[#69598C] px-3 py-1">{value}</span>;
                 }
                                   if (accessor === "action") {
                    const isThisInvoiceLoading = loadingInvoiceId === (row._id || row.id);
                    return (
                      <div className="flex gap-2">
                        <button
                          className="text-[#5e3bea] hover:underline text-sm font-medium disabled:opacity-50"
                          onClick={() => openEditModal(row)}
                          disabled={isLoadingInvoice}
                        >
                          {isThisInvoiceLoading ? 'Loading...' : 'View / Edit'}
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                          onClick={() => handlePrintInvoice(row)}
                          disabled={loading}
                          title="Print Invoice"
                        >
                          <FiPrinter size={14} />
                          Print
                        </button>
                      </div>
                    );
                  }
                 return <span className="text-sm text-gray-800">{row[accessor]}</span>;
               }}
             />

            {/* Always render Pagination, even if only one page */}
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              onPageChange={page => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        </main>

        <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingInvoiceId(null);
        setFormData(emptyForm);
        setShowMoreOptions(false);
      }}
      title={isEditing ? "Edit Invoice" : "Create Invoice"}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#fefefe] rounded-xl shadow-xl w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => {
              setIsModalOpen(false);
              setIsEditing(false);
              setEditingInvoiceId(null);
              setFormData(emptyForm);
              setShowMoreOptions(false);
            }}
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
          >
            &times;
          </button>

          <h2 className="text-2xl font-semibold mb-4 text-[#322e45]">
            {isEditing ? "Edit Invoice" : "Create Invoice"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="UID (required)" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.uid} onChange={(e) => handleInputChange("uid", e.target.value)} />
            <input placeholder="Name" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            <input placeholder="Phone" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
            
            {/* Payment Status select with custom arrow */}
            <div className="relative w-full mb-2">
              <select
                className={`w-full border p-2 pr-10 rounded-md appearance-none bg-white ${
                  formData.paymentStatus === "" ? "text-gray-400" : "text-black"
                }`}
                value={formData.paymentStatus}
                onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
              >
                <option value="">Select Payment Status</option>
                <option value="Billed">Billed</option>
                <option value="Unbilled">Unbilled</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                ▼
              </div>
            </div>

            <input placeholder="Private Notes" className="border border-gray-300 px-4 py-2 rounded-md col-span-full" value={formData.privateNotes} onChange={(e) => handleInputChange("privateNotes", e.target.value)} />
          </div>

          {/* Services */}
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-600 mb-2">
              <span>Service</span>
              <span>Qty</span>
              <span>Amount</span>
              <span>Discount</span>
            </div>
            {formData.services.map((s, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 mb-2">
                <input placeholder="Service" className="border border-gray-300 px-3 py-2 rounded-md" value={s.service} onChange={(e) => handleServiceChange(idx, "service", e.target.value)} />
                <input placeholder="Qty" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-3 py-2 rounded-md" value={s.qty === 0 ? "" : s.qty} onChange={(e) => handleServiceChange(idx, "qty", parseInt(e.target.value) || 0)} />
                <input placeholder="Amount" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-3 py-2 rounded-md" value={s.amount === 0 ? "" : s.amount} onChange={(e) => handleServiceChange(idx, "amount", parseFloat(e.target.value) || 0)} />
                <input placeholder="Discount" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-3 py-2 rounded-md" value={s.discount === 0 ? "" : s.discount} onChange={(e) => handleServiceChange(idx, "discount", parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>

          <textarea placeholder="Patient Note" className="border border-gray-300 px-4 py-2 rounded-md mt-4 w-full resize-none" value={formData.patientNote} onChange={(e) => handleInputChange("patientNote", e.target.value)} />
          {/* More Options Button */}
          <button
            className="px-4 py-1 mt-2 border rounded-full text-sm font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            {showMoreOptions ? "Hide Options" : "... More Options"}
          </button>

          {/* More Options Content */}
          {showMoreOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <input
                placeholder="Additional Discount"
                inputMode="numeric"
                pattern="[0-9]*"
                className="border border-gray-300 px-4 py-2 pr-10 rounded-md w-full leading-none"
                value={formData.additionalDiscount}
                onChange={(e) => handleInputChange("additionalDiscount", parseFloat(e.target.value) || 0)}
              />
              <div className="relative w-full">
                <select
                  className="border border-gray-300 px-4 py-2 pr-10 rounded-md appearance-none w-full leading-none"
                  value={formData.paymentMode}
                  onChange={(e) => handleInputChange("paymentMode", e.target.value)}
                >
                  <option>Cash</option>
                  <option>Credit Card</option>
                  <option>UPI</option>
                  <option>Online</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm">
                  ▼
                </div>
              </div>
            </div>
          )}


          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-[#fefefe]  mt-8 p-2 border-t">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full text-sm">
              <div className="text-gray-700 space-y-1">
                <div>Total Amount: ₹ {formData.services.reduce((acc, s) => acc + ((s.qty * s.amount) - s.discount || 0), 0)}</div>
                <div className="font-semibold text-base">Grand Total: ₹ {
                  Math.max(
                    formData.services.reduce((acc, s) => acc + ((s.qty * s.amount) - s.discount || 0), 0)
                    - (formData.additionalDiscount || 0),
                    0
                  )
                }</div>
              </div>

              <div className="flex justify-end gap-4 w-full md:w-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                                 <button
                   onClick={handleCreateOrUpdateInvoice}
                   disabled={loading}
                   className="px-5 py-2 rounded-md bg-[#6842ff] text-white hover:bg-[#472dc4] disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Invoice" : "Create Invoice")}
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

      </div>
    </div>
  );
};

export default Invoice;






{/*{isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#fefefe] rounded-xl shadow-xl w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setEditingInvoiceId(null);
                  setFormData(emptyForm);
                }}
                className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-[#322e45]">
                {isEditing ? "Edit Invoice" : "Create Invoice"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input placeholder="UID" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.uid} onChange={(e) => handleInputChange("uid", e.target.value)} />
                <input placeholder="Name" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                <input placeholder="Phone" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                <select className="border border-gray-300 px-4 py-2 rounded-md" value={formData.paymentStatus} onChange={(e) => handleInputChange("paymentStatus", e.target.value)}>
                  <option>Billed</option>
                  <option>Unbilled</option>
                  <option>Partially Paid</option>
                </select>
                <input placeholder="Private Notes" className="border border-gray-300 px-4 py-2 rounded-md col-span-full" value={formData.privateNotes} onChange={(e) => handleInputChange("privateNotes", e.target.value)} />
              </div>

              <div className="mt-8">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-600 mb-2">
                  <span>Service</span>
                  <span>Qty</span>
                  <span>Amount</span>
                  <span>Discount</span>
                </div>
                {formData.services.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 mb-2">
                    <input placeholder="Service" className="border border-gray-300 px-3 py-2 rounded-md" value={s.service} onChange={(e) => handleServiceChange(idx, "service", e.target.value)} />
                    <input placeholder="Qty" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-3 py-2 rounded-md" value={s.qty} onChange={(e) => handleServiceChange(idx, "qty", parseInt(e.target.value) || 0)} />
                    <input placeholder="Amount" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-3 py-2 rounded-md" value={s.amount} onChange={(e) => handleServiceChange(idx, "amount", parseFloat(e.target.value) || 0)} />
                    <input placeholder="Discount" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-3 py-2 rounded-md" value={s.discount} onChange={(e) => handleServiceChange(idx, "discount", parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <input placeholder="Additional Discount" inputMode="numeric" pattern="[0-9]*" className="border border-gray-300 px-4 py-2 rounded-md" value={formData.additionalDiscount} onChange={(e) => handleInputChange("additionalDiscount", parseFloat(e.target.value) || 0)} />
                <select className="border border-gray-300 px-4 py-2 rounded-md" value={formData.paymentMode} onChange={(e) => handleInputChange("paymentMode", e.target.value)}>
                  <option>Cash</option>
                  <option>Credit Card</option>
                  <option>UPI</option>
                  <option>Online</option>
                </select>
              </div>

              <textarea placeholder="Patient Note" className="border border-gray-300 px-4 py-2 rounded-md mt-4 w-full resize-none" value={formData.patientNote} onChange={(e) => handleInputChange("patientNote", e.target.value)} />

              <div className="mt-6 text-right font-medium text-lg">
                {(() => {
                  let totalAmount = 0;
                  formData.services.forEach((s) => {
                    const lineTotal = (s.qty * s.amount) - s.discount;
                    totalAmount += lineTotal > 0 ? lineTotal : 0;
                  });

                  const additionalDiscount = formData.additionalDiscount || 0;
                  const grandTotal = totalAmount - additionalDiscount > 0 ? totalAmount - additionalDiscount : 0;

                  return (
                    <div className="flex justify-between items-center w-full">
                      <div>Total Amount: ₹ {totalAmount}</div>
                      <div className="font-bold text-xl">Grand Total: ₹ {grandTotal}</div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                  Cancel
                </button>
                <button onClick={handleCreateOrUpdateInvoice} className="px-5 py-2 rounded-md bg-[#6842ff] text-white hover:bg-[#472dc4]">
                  {isEditing ? "Update Invoice" : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        )}*/}

