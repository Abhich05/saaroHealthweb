import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiFileText, FiChevronDown, FiChevronUp, FiEye } from 'react-icons/fi';
import { FaHeartbeat, FaThermometerHalf, FaPills, FaNotesMedical } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const PastVisitsSection = ({ patient, doctorId }) => {
  const [pastVisits, setPastVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedVisit, setExpandedVisit] = useState(null);

  useEffect(() => {
    if (patient?._id && doctorId) {
      fetchPastVisits();
    }
  }, [patient?._id, doctorId]);

  const fetchPastVisits = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/doctors/${doctorId}/patients/${patient._id}/prescriptions/history`);
      
      if (response.data.consultations) {
        setPastVisits(response.data.consultations);
      }
    } catch (error) {
      console.error('Error fetching past visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultationTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      followup: 'bg-green-100 text-green-800',
      emergency: 'bg-red-100 text-red-800',
      specialty: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || colors.general;
  };

  const getConsultationTypeIcon = (type) => {
    const icons = {
      general: <FaNotesMedical />,
      followup: <FiCalendar />,
      emergency: <FaHeartbeat />,
      specialty: <FaPills />
    };
    return icons[type] || icons.general;
  };

  const toggleVisitExpansion = (visitId) => {
    setExpandedVisit(expandedVisit === visitId ? null : visitId);
  };

  const renderVitals = (vitals) => {
    if (!vitals) return null;
    
    const vitalEntries = Object.entries(vitals).filter(([key, value]) => value && value.trim() !== '');
    
    if (vitalEntries.length === 0) return null;

    return (
      <div className="mb-4">
        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
          <FaThermometerHalf className="mr-2 text-red-500" />
          Vital Signs
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {vitalEntries.map(([key, value]) => (
            <div key={key} className="bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-xs text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="font-medium">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComplaints = (complaints) => {
    if (!complaints || complaints.length === 0) return null;
    
    const validComplaints = complaints.filter(complaint => complaint.text && complaint.text.trim() !== '');
    if (validComplaints.length === 0) return null;

    return (
      <div className="mb-4">
        <h5 className="font-semibold text-gray-700 mb-2">Chief Complaints</h5>
        <ul className="list-disc list-inside space-y-1">
          {validComplaints.map((complaint, index) => (
            <li key={index} className="text-gray-600">{complaint.text}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDiagnosis = (diagnosis) => {
    if (!diagnosis) return null;
    
    const provisional = diagnosis.provisional?.filter(d => d.value && d.value.trim() !== '') || [];
    const final = diagnosis.final?.filter(d => d.value && d.value.trim() !== '') || [];
    
    if (provisional.length === 0 && final.length === 0) return null;

    return (
      <div className="mb-4">
        <h5 className="font-semibold text-gray-700 mb-2">Diagnosis</h5>
        {provisional.length > 0 && (
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600">Provisional:</span>
            <ul className="list-disc list-inside ml-4">
              {provisional.map((diag, index) => (
                <li key={index} className="text-gray-600">{diag.value}</li>
              ))}
            </ul>
          </div>
        )}
        {final.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600">Final:</span>
            <ul className="list-disc list-inside ml-4">
              {final.map((diag, index) => (
                <li key={index} className="text-gray-600">{diag.value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderMedications = (medications) => {
    if (!medications || medications.length === 0) return null;
    
    const validMedications = medications.filter(med => med.name && med.name.trim() !== '');
    if (validMedications.length === 0) return null;

    return (
      <div className="mb-4">
        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
          <FaPills className="mr-2 text-green-500" />
          Medications
        </h5>
        <div className="space-y-2">
          {validMedications.map((med, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-800">{med.name}</div>
              <div className="text-sm text-gray-600">
                {med.dosage && <span>Dosage: {med.dosage}</span>}
                {med.frequency && <span className="ml-2">Frequency: {med.frequency}</span>}
                {med.duration && <span className="ml-2">Duration: {med.duration}</span>}
              </div>
              {med.notes && <div className="text-sm text-gray-500 mt-1">Notes: {med.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-6 rounded-xl mt-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (pastVisits.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6 rounded-xl mt-6 shadow-md">
        <div className="text-center py-8">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Visits</h3>
          <p className="text-gray-600">This patient has no previous consultation history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl mt-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <FiCalendar className="mr-2 text-blue-600" />
          Past Consultation Visits
        </h3>
        <span className="text-sm text-gray-500">{pastVisits.length} visit{pastVisits.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {pastVisits.map((visit, index) => (
          <div key={visit._id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Visit Header */}
            <div 
              className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => toggleVisitExpansion(visit._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getConsultationTypeColor(visit.consultationType)}`}>
                    {getConsultationTypeIcon(visit.consultationType)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Visit #{pastVisits.length - index}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <FiClock className="mr-1" />
                      {formatDate(visit.consultationDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConsultationTypeColor(visit.consultationType)}`}>
                    {visit.consultationType}
                  </span>
                  {expandedVisit === visit._id ? (
                    <FiChevronUp className="text-gray-500" />
                  ) : (
                    <FiChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Visit Details */}
            {expandedVisit === visit._id && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="space-y-4">
                  {renderVitals(visit.vitals)}
                  {renderComplaints(visit.complaints)}
                  {renderDiagnosis(visit.diagnosis)}
                  {renderMedications(visit.medication)}
                  
                  {visit.advice && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Advice</h5>
                      <p className="text-gray-600">{visit.advice}</p>
                    </div>
                  )}
                  
                  {visit.notes && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Notes</h5>
                      <p className="text-gray-600">{visit.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastVisitsSection; 