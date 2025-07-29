import React from "react";
import { FiUsers, FiClock, FiCheckCircle, FiUserCheck } from "react-icons/fi";

const iconMap = {
  "Total Patients": <FiUsers />,
  "Waiting": <FiClock />,
  "In Consultation": <FiUserCheck />,
  "Completed": <FiCheckCircle />,
};

const bgColorMap = {
  "Total Patients": "bg-blue-100 text-blue-600",
  "Waiting": "bg-yellow-100 text-yellow-600",
  "In Consultation": "bg-purple-100 text-purple-600",
  "Completed": "bg-green-100 text-green-600",
};

export default function StatBox({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map(({ label, value }, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02] border border-gray-100 text-center"
        >
          <div className="flex justify-center mb-4">
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-full ${bgColorMap[label] || "bg-gray-100 text-gray-600"}`}
            >
              <span className="text-2xl">{iconMap[label]}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
  <h3 className="text-sm font-medium text-gray-600">{label}</h3>
  <p className="text-xl font-bold text-gray-900">{value}</p>
</div>

        </div>
      ))}
    </div>
  );
}
