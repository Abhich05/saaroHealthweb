import React from 'react';
import Modal from './Modal';
import Button from './Button';
import PrescriptionPrint from './PrescriptionPrint';
import { FiPrinter, FiEye, FiX } from 'react-icons/fi';

const PrescriptionPreviewModal = ({ 
  isOpen, 
  onClose, 
  patient, 
  formData, 
  doctorInfo, 
  customSections,
  onPrint 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prescription Preview" size="full">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prescription Preview</h2>
            <p className="text-gray-600">Review the prescription before printing</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="flex items-center"
            >
              <FiX className="mr-2" />
              Close
            </Button>
            <Button 
              onClick={onPrint}
              className="flex items-center"
            >
              <FiPrinter className="mr-2" />
              Print Prescription
            </Button>
          </div>
        </div>

        {/* Prescription Content */}
        <div className="bg-gray-50 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <PrescriptionPrint 
              patient={patient}
              formData={formData}
              doctorInfo={doctorInfo}
              customSections={customSections}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={onPrint}
            className="flex items-center"
          >
            <FiPrinter className="mr-2" />
            Print Prescription
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PrescriptionPreviewModal; 