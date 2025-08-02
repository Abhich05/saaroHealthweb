import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { FiPlus, FiType, FiList, FiCalendar, FiCheckSquare, FiChevronDown } from 'react-icons/fi';

const AddSectionModal = ({ isOpen, onClose, onAddSection }) => {
  const [sectionData, setSectionData] = useState({
    heading: '',
    label: '',
    type: '',
    options: '',
    required: false
  });

  const [errors, setErrors] = useState({});

  const inputTypes = [
    { value: 'input', label: 'Text Input', icon: FiType, description: 'Single line text input' },
    { value: 'textarea', label: 'Text Area', icon: FiType, description: 'Multi-line text input' },
    { value: 'date', label: 'Date Picker', icon: FiCalendar, description: 'Date selection' },
    { value: 'dropdown', label: 'Dropdown', icon: FiChevronDown, description: 'Select from options' },
    { value: 'checkbox', label: 'Checkbox', icon: FiCheckSquare, description: 'Yes/No selection' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!sectionData.heading.trim()) {
      newErrors.heading = 'Section heading is required';
    }
    
    if (!sectionData.label.trim()) {
      newErrors.label = 'Field label is required';
    }
    
    if (!sectionData.type) {
      newErrors.type = 'Please select an input type';
    }
    
    if (sectionData.type === 'dropdown' && !sectionData.options.trim()) {
      newErrors.options = 'Options are required for dropdown';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddSection(sectionData);
      setSectionData({ heading: '', label: '', type: '', options: '', required: false });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setSectionData({ heading: '', label: '', type: '', options: '', required: false });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Section" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPlus className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create Custom Section</h2>
          <p className="text-gray-600">Add a new custom section to your consultation form</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Section Heading */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Section Heading *
            </label>
            <input
              type="text"
              className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-lg ${
                errors.heading ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="e.g., 'Family History', 'Lifestyle Assessment'"
              value={sectionData.heading}
              onChange={(e) => setSectionData({ ...sectionData, heading: e.target.value })}
            />
            {errors.heading && (
              <p className="text-red-500 text-sm mt-1">{errors.heading}</p>
            )}
          </div>

          {/* Field Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Field Label *
            </label>
            <input
              type="text"
              className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-lg ${
                errors.label ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="e.g., 'Medical Condition', 'Date of Onset'"
              value={sectionData.label}
              onChange={(e) => setSectionData({ ...sectionData, label: e.target.value })}
            />
            {errors.label && (
              <p className="text-red-500 text-sm mt-1">{errors.label}</p>
            )}
          </div>

          {/* Input Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Input Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inputTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.value}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      sectionData.type === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSectionData({ ...sectionData, type: type.value })}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        sectionData.type === type.value
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Dropdown Options */}
          {sectionData.type === 'dropdown' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Options (comma-separated) *
              </label>
              <textarea
                className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none ${
                  errors.options ? 'border-red-300' : 'border-gray-200'
                }`}
                rows="3"
                placeholder="e.g., Yes, No, Sometimes, Not Applicable"
                value={sectionData.options}
                onChange={(e) => setSectionData({ ...sectionData, options: e.target.value })}
              />
              {errors.options && (
                <p className="text-red-500 text-sm mt-1">{errors.options}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple options with commas
              </p>
            </div>
          )}

          {/* Required Field Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="required"
              checked={sectionData.required}
              onChange={(e) => setSectionData({ ...sectionData, required: e.target.checked })}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Make this field required
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <FiList className="w-5 h-5 text-green-600 mr-2" />
            Section Preview
          </h4>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">{sectionData.heading || 'Section Heading'}</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                {sectionData.label || 'Field Label'}
                {sectionData.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-3">
              {sectionData.type === 'input' && (
                <input
                  type="text"
                  placeholder="Text input"
                  className="w-full border-none outline-none bg-transparent"
                  disabled
                />
              )}
              {sectionData.type === 'textarea' && (
                <textarea
                  placeholder="Multi-line text input"
                  className="w-full border-none outline-none bg-transparent resize-none"
                  rows="2"
                  disabled
                />
              )}
              {sectionData.type === 'date' && (
                <input
                  type="date"
                  className="w-full border-none outline-none bg-transparent"
                  disabled
                />
              )}
              {sectionData.type === 'dropdown' && (
                <select className="w-full border-none outline-none bg-transparent">
                  <option>Select option</option>
                  {sectionData.options.split(',').map((option, index) => (
                    <option key={index}>{option.trim()}</option>
                  ))}
                </select>
              )}
              {sectionData.type === 'checkbox' && (
                <label className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="w-4 h-4" />
                  <span className="text-gray-600">{sectionData.label || 'Checkbox option'}</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="success">
            <FiPlus className="mr-2" />
            Add Section
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSectionModal; 