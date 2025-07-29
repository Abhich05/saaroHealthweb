{/*export const rxData = [
  { uid: "12345", name: "Sophia Clark", phone: "555-123-4567", lastVisit: "2023-11-15", category: "Follow-up" },
  { uid: "67890", name: "Ethan Miller", phone: "555-987-6543", lastVisit: "2023-11-10", category: "Emergency" },
  { uid: "24680", name: "Olivia Davis", phone: "555-246-8012", lastVisit: "2023-11-05", category: "Chronic" },
  { uid: "13579", name: "Liam Wilson", phone: "555-135-7924", lastVisit: "2023-10-30", category: "Follow-up" },
  { uid: "97531", name: "Ava Martinez", phone: "555-975-3146", lastVisit: "2023-10-25", category: "Emergency" },
  { uid: "86420", name: "Noah Anderson", phone: "555-864-2038", lastVisit: "2023-10-20", category: "Chronic" },
  { uid: "75309", name: "Isabella Taylor", phone: "555-753-0980", lastVisit: "2023-10-15", category: "Follow-up" },
  { uid: "36925", name: "Jackson Thomas", phone: "555-369-2582", lastVisit: "2023-10-10", category: "Emergency" },
  { uid: "48260", name: "Mia Moore", phone: "555-482-6014", lastVisit: "2023-10-05", category: "Chronic" },
  { uid: "59147", name: "Aiden Jackson", phone: "555-591-4736", lastVisit: "2023-09-30", category: "Follow-up" },
];

rxData.forEach((patient) => {
  patient.img = `/${patient.name}.png`;
});*/}

export const rxData = [
  {
    uid: "12345",
    name: "Sophia Clark",
    phone: "555-123-4567",
    lastVisit: "2023-11-15",
    category: "Follow-up",
    prescriptions: [
      {
        date: "2023-10-01",
        doctor: "Dr. Smith",
        notes: "Follow-up for hypertension.",
        medicines: ["Amlodipine 5mg", "Losartan 50mg"]
      },
      {
        date: "2023-09-10",
        doctor: "Dr. Brown",
        notes: "Routine blood pressure check.",
        medicines: ["Amlodipine 5mg"]
      }
    ]
  },
  {
    uid: "67890",
    name: "Ethan Miller",
    phone: "555-987-6543",
    lastVisit: "2023-11-10",
    category: "Emergency",
    prescriptions: [
      {
        date: "2023-09-15",
        doctor: "Dr. Lee",
        notes: "Treated for acute allergic reaction.",
        medicines: ["Cetirizine 10mg", "Prednisone 20mg"]
      },
      {
        date: "2023-08-25",
        doctor: "Dr. Kim",
        notes: "Follow-up after reaction.",
        medicines: ["Loratadine 10mg"]
      }
    ]
  },
  {
    uid: "24680",
    name: "Olivia Davis",
    phone: "555-246-8012",
    lastVisit: "2023-11-05",
    category: "Chronic",
    prescriptions: [
      {
        date: "2023-10-05",
        doctor: "Dr. Adams",
        notes: "Diabetes medication adjustment.",
        medicines: ["Metformin 500mg", "Glimepiride 2mg"]
      },
      {
        date: "2023-09-01",
        doctor: "Dr. Adams",
        notes: "Routine diabetes follow-up.",
        medicines: ["Metformin 500mg"]
      }
    ]
  },
  {
    uid: "13579",
    name: "Liam Wilson",
    phone: "555-135-7924",
    lastVisit: "2023-10-30",
    category: "Follow-up",
    prescriptions: [
      {
        date: "2023-09-20",
        doctor: "Dr. Patel",
        notes: "Post-operative check-up.",
        medicines: ["Ibuprofen 400mg"]
      },
      {
        date: "2023-08-15",
        doctor: "Dr. Patel",
        notes: "Surgical wound care.",
        medicines: ["Paracetamol 500mg"]
      }
    ]
  },
  {
    uid: "97531",
    name: "Ava Martinez",
    phone: "555-975-3146",
    lastVisit: "2023-10-25",
    category: "Emergency",
    prescriptions: [
      {
        date: "2023-09-05",
        doctor: "Dr. Thompson",
        notes: "Treated for asthma exacerbation.",
        medicines: ["Salbutamol inhaler", "Prednisolone 30mg"]
      },
      {
        date: "2023-08-10",
        doctor: "Dr. Thompson",
        notes: "Asthma maintenance visit.",
        medicines: ["Fluticasone inhaler"]
      }
    ]
  },
  {
    uid: "86420",
    name: "Noah Anderson",
    phone: "555-864-2038",
    lastVisit: "2023-10-20",
    category: "Chronic",
    prescriptions: [
      {
        date: "2023-09-15",
        doctor: "Dr. Lee",
        notes: "Back pain management.",
        medicines: ["Naproxen 500mg", "Tizanidine 2mg"]
      },
      {
        date: "2023-08-20",
        doctor: "Dr. Lee",
        notes: "Physical therapy follow-up.",
        medicines: ["Paracetamol 500mg"]
      }
    ]
  },
  {
    uid: "75309",
    name: "Isabella Taylor",
    phone: "555-753-0980",
    lastVisit: "2023-10-15",
    category: "Follow-up",
    prescriptions: [
      {
        date: "2023-09-01",
        doctor: "Dr. Young",
        notes: "Seasonal allergies.",
        medicines: ["Cetirizine 10mg"]
      },
      {
        date: "2023-08-05",
        doctor: "Dr. Young",
        notes: "Check-up for allergies.",
        medicines: ["Loratadine 10mg"]
      }
    ]
  },
  {
    uid: "36925",
    name: "Jackson Thomas",
    phone: "555-369-2582",
    lastVisit: "2023-10-10",
    category: "Emergency",
    prescriptions: [
      {
        date: "2023-09-10",
        doctor: "Dr. Ramirez",
        notes: "Minor head injury.",
        medicines: ["Paracetamol 500mg"]
      },
      {
        date: "2023-08-15",
        doctor: "Dr. Ramirez",
        notes: "Sutures removal follow-up.",
        medicines: []
      }
    ]
  },
  {
    uid: "48260",
    name: "Mia Moore",
    phone: "555-482-6014",
    lastVisit: "2023-10-05",
    category: "Chronic",
    prescriptions: [
      {
        date: "2023-09-05",
        doctor: "Dr. Baker",
        notes: "Thyroid function check.",
        medicines: ["Levothyroxine 50mcg"]
      },
      {
        date: "2023-08-01",
        doctor: "Dr. Baker",
        notes: "Routine thyroid visit.",
        medicines: ["Levothyroxine 50mcg"]
      }
    ]
  },
  {
    uid: "59147",
    name: "Aiden Jackson",
    phone: "555-591-4736",
    lastVisit: "2023-09-30",
    category: "Follow-up",
    prescriptions: [
      {
        date: "2023-08-15",
        doctor: "Dr. Wilson",
        notes: "High cholesterol follow-up.",
        medicines: ["Atorvastatin 20mg"]
      },
      {
        date: "2023-07-20",
        doctor: "Dr. Wilson",
        notes: "Initial cholesterol assessment.",
        medicines: ["Atorvastatin 20mg"]
      }
    ]
  }
];

// Add image field to each
rxData.forEach((patient) => {
  patient.img = `/${patient.name}.png`;
});
