import React, { useState, useEffect, useContext, useMemo } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import KPISection from "../components/ui/KpiSection";
import GenericTable from "../components/ui/GenericTable";
import Modal from '../components/ui/GenericModal'; // adjust path as needed
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';
import Loading from "../components/ui/Loading";

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
   const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [invoicesData, setInvoicesData] = useState([]);
  const doctorId = useContext(DoctorIdContext);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/${doctorId}/invoice?page=${pagination.page}&limit=${pagination.limit}&searchQuery=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        const invoices = Array.isArray(res.data.invoices) ? res.data.invoices : [];
        const mapped = invoices.map(inv => ({
          id: inv.invoiceId || inv._id,
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
      .catch(() => {
        setInvoicesData([]);
        setPagination(prev => ({ ...prev, total: 0 }));
        setError("Failed to fetch invoices. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [doctorId, pagination.page, pagination.limit, searchTerm]);

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
    if (formData.uid.trim().length < 3) {
      alert("UID should be at least 3 characters long");
      return;
    }
    if (formData.name.trim().length < 3) {
      alert("Name should be at least 3 characters long");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    const total = formData.services.reduce((sum, s) => {
      return sum + (s.qty * s.amount - s.discount);
    }, 0) - parseFloat(formData.additionalDiscount || 0);

    setLoading(true);
    setError("");
    if (isEditing) {
      // You can implement update logic here if needed
      setLoading(false);
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingInvoiceId(null);
      setFormData(emptyForm);
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
      .then(() => {
        setPagination(prev => ({ ...prev })); // triggers useEffect to refetch
      })
      .catch((err) => {
        const msg =
          (Array.isArray(err?.response?.data) && err.response.data[0]?.message) ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to create invoice';
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

  const openEditModal = (invoice) => {
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
    setEditingInvoiceId(invoice.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // const filteredInvoices = invoicesData.filter((invoice) => {
  //   const searchMatch =
  //     invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     invoice.name.toLowerCase().includes(searchTerm.toLowerCase());

  //   const today = new Date();
  //   const invoiceDate = new Date(invoice.date);
  //   let dateMatch = true;

  //   if (dateFilter === "Last 30 days") {
  //     const past = new Date();
  //     past.setDate(today.getDate() - 30);
  //     dateMatch = invoiceDate >= past;
  //   } else if (dateFilter === "Last 90 days") {
  //     const past = new Date();
  //     past.setDate(today.getDate() - 90);
  //     dateMatch = invoiceDate >= past;
  //   }

  //   const statusMatch = statusFilter === "All" || invoice.status === statusFilter;
  //   const modeMatch = modeFilter === "All" || invoice.mode === modeFilter;

  //   return searchMatch && dateMatch && statusMatch && modeMatch;
  // });
  const filteredInvoices = invoicesData;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  // KPI calculations
  const kpiData = useMemo(() => {
    // Filter invoices for this month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const invoicesThisMonth = invoicesData.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const totalInvoicesThisMonth = invoicesThisMonth.length;
    const totalRevenue = invoicesData.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const pendingPayments = invoicesData
      .filter(inv => inv.status && inv.status.toLowerCase().includes('pending'))
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    // Dummy percent changes for now
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
        label: 'Pending Payments',
        value: `₹ ${pendingPayments.toLocaleString()}`,
        change: '-2%',
        changeType: 'negative',
        icon: '/pending.svg',
        color: '#fef9c3',
      },
    ];
  }, [invoicesData]);

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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl leading-10 font-semibold text-[#322e45]">Invoices</h1>
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

            {/* KPIs Section - use shared KPISection for Dashboard style */}
            <div className="w-max-lg mx-auto mb-8">
              <KPISection kpis={kpiData} />
            </div>

            <GenericTable
              columns={columns}
              data={invoicesData}
              renderCell={(row, accessor) => {
                if (accessor === "status") {
                  return <span className="text-sm px-3 py-1">{row.status}</span>;
                }
                if (["name", "mode", "date"].includes(accessor)) {
                  return <span className="text-sm text-[#69598C] px-3 py-1">{row[accessor]}</span>;
                }
                if (accessor === "action") {
                  return (
                    <button
                      className="text-[#5e3bea] hover:underline text-sm font-medium"
                      onClick={() => openEditModal(row)}
                    >
                      View / Edit
                    </button>
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
                  className="px-5 py-2 rounded-md bg-[#6842ff] text-white hover:bg-[#472dc4]"
                >
                  {isEditing ? "Update Invoice" : "Create Invoice"}
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

