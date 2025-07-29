import React from 'react';

const VitalsGrid = ({ vitals, setFormData }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(vitals).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <label className="mb-1 font-medium">{key.toUpperCase()}</label>
          <input
            value={value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, [key]: e.target.value },
              }))
            }
            placeholder={key.toUpperCase()}
            className="border p-2 rounded bg-gray-100"
          />
        </div>
      ))}
    </div>
  );
};

export default VitalsGrid;
