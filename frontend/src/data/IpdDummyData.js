export const ipdData = [
  { id: "IPD-2023-001", name: "Sophia Clark", admissionDate: "2023-01-15", dischargeDate: "2023-01-25", status: "Discharged" },
  { id: "IPD-2023-002", name: "Ethan Miller", admissionDate: "2023-02-20", dischargeDate: "2023-03-05", status: "Discharged" },
  { id: "IPD-2023-003", name: "Olivia Davis", admissionDate: "2023-03-10", dischargeDate: "2023-03-20", status: "Discharged" },
  { id: "IPD-2023-004", name: "Liam Wilson", admissionDate: "2023-04-05", dischargeDate: "2023-04-15", status: "Discharged" },
  { id: "IPD-2023-005", name: "Ava Martinez", admissionDate: "2023-05-12", dischargeDate: "2023-05-22", status: "Discharged" },
];
ipdData.forEach((patient) => {
  patient.img = `/${patient.name}.png`;
});