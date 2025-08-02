import React from 'react';
import {
  FaHeartbeat,
  FaThermometerHalf,
  FaRulerVertical,
  FaWeight,
  FaTachometerAlt,
  FaLungs,
  FaSyringe
} from 'react-icons/fa';

const VitalsGrid = ({ vitals, setFormData }) => {
  const vitalConfigs = {
    bp: { label: 'Blood Pressure', icon: FaHeartbeat, placeholder: '120/80', unit: 'mmHg' },
    pulse: { label: 'Pulse Rate', icon: FaHeartbeat, placeholder: '72', unit: 'bpm' },
    height: { label: 'Height', icon: FaRulerVertical, placeholder: '170', unit: 'cm' },
    weight: { label: 'Weight', icon: FaWeight, placeholder: '70', unit: 'kg' },
    temperature: { label: 'Temperature', icon: FaThermometerHalf, placeholder: '98.6', unit: '°F' },
    spo2: { label: 'SpO2', icon: FaLungs, placeholder: '98', unit: '%' },
    rbs: { label: 'RBS', icon: FaSyringe, placeholder: '100', unit: 'mg/dL' }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
          <FaTachometerAlt className="text-white text-lg" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Vital Signs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(vitals).map(([key, value]) => {
          const config = vitalConfigs[key];
          const IconComponent = config.icon;

          return (
            <div key={key} className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <IconComponent className="text-purple-600 mr-2 text-sm" />
                {config.label}
              </label>
              <div className="relative">
                <input
                  value={value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, [key]: e.target.value },
                    }))
                  }
                  placeholder={config.placeholder}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200
                           group-hover:border-purple-300 bg-white"
                />
                {config.unit && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                    {config.unit}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={() => setFormData(prev => ({
              ...prev,
              vitals: {
                bp: '', pulse: '', height: '', weight: '',
                temperature: '', spo2: '', rbs: ''
              }
            }))}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default VitalsGrid;
