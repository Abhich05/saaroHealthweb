export const INVOICE_KPIS = [
  { label: "Total Invoices This Month", value: "250", change: "+10%", changeType: "positive",icon:"/invoice.svg",color: "#D5E4FA" },
  { label: "Total Revenue", value: "₹ 75,000", change: "+5%", changeType: "positive",icon:"/revenue.svg",color:"#E5D6FB" },
  { label: "Pending Payments", value: "₹ 15,000", change: "-2%", changeType: "negative" ,icon:"/pending.svg",color:"#FBD3F5"},
];

export const invoicesData = [
  { id: "INV-20240715-001", name: "Sophia Clark", date: "2024-07-15", amount: 500, status: "Billed", mode: "Cash" },
  { id: "INV-20240714-002", name: "Liam Walker", date: "2024-07-14", amount: 750, status: "Unbilled", mode: "UPI" },
  { id: "INV-20240713-003", name: "Olivia Harris", date: "2024-07-13", amount: 1200, status: "Partially Paid", mode: "Card" },
  { id: "INV-20240701-004", name: "Noah Carter", date: "2024-07-01", amount: 300, status: "Billed", mode: "Insurance" },
  { id: "INV-20240610-005", name: "Ava Turner", date: "2024-06-10", amount: 600, status: "Unbilled", mode: "Cash" },
];