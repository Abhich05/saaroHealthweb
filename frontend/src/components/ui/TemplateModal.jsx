import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FiSave, FiFile, FiThermometer } from 'react-icons/fi';
import { FaHeartbeat, FaBaby, FaStethoscope } from 'react-icons/fa';
import { MdOutlineMonitorHeart } from 'react-icons/md';

const TemplateModal = ({ 
  isOpen, 
  onClose, 
  onLoadTemplate, 
  onSaveCustomTemplate, 
  customTemplateData, 
  setCustomTemplateData,
  showCustomForm,
  setShowCustomForm,
  inbuiltTemplates = {}
}) => {
  const templates = [
         {
       key: 'general',
       name: 'General Consultation',
       description: 'Standard consultation template for general health issues',
       icon: FiFile,
       color: 'from-blue-500 to-cyan-500',
       bgColor: 'bg-blue-50',
       borderColor: 'border-blue-200'
     },
    {
      key: 'fever',
      name: 'Fever & Infection',
      description: 'Template for fever, cold, and infection cases',
      icon: FiThermometer,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      key: 'diabetes',
      name: 'Diabetes Management',
      description: 'Template for diabetes follow-up and management',
      icon: FaHeartbeat,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      key: 'hypertension',
      name: 'Hypertension',
      description: 'Template for blood pressure management',
      icon: MdOutlineMonitorHeart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      key: 'pediatrics',
      name: 'Pediatrics',
      description: 'Template for pediatric consultations',
      icon: FaBaby,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  if (showCustomForm) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Save Custom Template" size="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiSave className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Save Custom Template</h2>
            <p className="text-gray-600">Create a reusable template from your current consultation</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Template Name *</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                placeholder="Enter template name (e.g., 'Cardiology Consultation')"
                value={customTemplateData.name}
                onChange={(e) => setCustomTemplateData({ ...customTemplateData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                rows="4"
                placeholder="Describe what this template is for (optional)"
                value={customTemplateData.description}
                onChange={(e) => setCustomTemplateData({ ...customTemplateData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Template Preview
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Current form data will be saved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Custom sections will be included</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Section order will be preserved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Template will be available for future use</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              variant="secondary"
              onClick={() => setShowCustomForm(false)}
            >
              Back to Templates
            </Button>
            <Button 
              onClick={onSaveCustomTemplate}
              loading={false}
            >
              <FiSave className="mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Template" size="xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select from our pre-built templates or save your current consultation for future use
          </p>
        </div>
        
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Save Current Template Card */}
          <div 
            className="group bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-dashed border-purple-400 rounded-2xl p-6 hover:border-purple-500 hover:shadow-2xl cursor-pointer transition-all duration-300 h-48 flex flex-col justify-between transform hover:scale-105"
            onClick={() => setShowCustomForm(true)}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiSave className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  Save Current Template
                </h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                Save your current consultation as a custom template. This will include all your form data, custom sections, and section order for future use.
              </p>
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                Save Template
              </Button>
            </div>
          </div>

          {/* Inbuilt Templates */}
                     {Object.entries(inbuiltTemplates).map(([key, template]) => {
             const templateConfig = templates.find(t => t.key === key);
             const IconComponent = templateConfig?.icon || FiFile;
             const color = templateConfig?.color || 'from-blue-500 to-cyan-500';
             const borderColor = templateConfig?.borderColor || 'border-blue-200';
            
            return (
              <div 
                key={key}
                className={`group bg-white border-2 ${borderColor} rounded-2xl p-6 hover:border-purple-400 hover:shadow-2xl cursor-pointer transition-all duration-300 h-48 flex flex-col justify-between transform hover:scale-105`}
                onClick={() => onLoadTemplate(key)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <IconComponent className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {template.description}
                  </p>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    Load Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end pt-8 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateModal; 