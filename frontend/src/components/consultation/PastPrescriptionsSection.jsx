import React from "react";

const PastPrescriptionsSection = ({ patient }) => {
  // patient.prescriptions is now real-time from backend
  if (!patient?.prescriptions || patient.prescriptions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mt-6">
        <p className="text-gray-600">No past prescriptions available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl mt-6 shadow-md">
      <h2 className="text-[22px] font-semibold text-[#2E2E2E] mb-4">Past Visits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patient.prescriptions.map((rx, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow hover:shadow-lg hover:scale-105 transition"
          >
                   <p className="text-sm text-gray-600"><strong>Date:</strong> {rx.date}</p>
                    <p className="text-sm text-gray-600"><strong>Doctor:</strong> {rx.doctor}</p>
                    <p className="text-sm text-gray-600"><strong>Notes:</strong> {rx.notes}</p>
                    <p className="text-sm text-gray-600"><strong>Medicines:</strong></p>
            <ul className="list-disc list-inside text-gray-700">
              {rx.medicines.map((med, i) => (
                <li key={i}>{med}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastPrescriptionsSection;
