import React from 'react';
import PatientAvatar from './PatientAvatar';

const PatientDetailsCard = ({ patient, className = '' }) => {
  if (!patient) return null;

  const formatAge = (age) => {
    if (!age) return '';
    return `${age}y`;
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start space-x-4 mb-6">
        <PatientAvatar patient={patient} size="lg" />
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {patient.title && `${patient.title} `}{patient.fullName || patient.name}
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              ({formatAge(patient.age)}, {patient.gender})
            </span>
          </div>
          
          {/* Primary Contact Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span className="font-medium">UID: {patient.uid}</span>
            <span>•</span>
            <span>{formatPhone(patient.phoneNumber || patient.phone)}</span>
            {patient.alternatePhoneNumber && (
              <>
                <span>•</span>
                <span>Alt: {formatPhone(patient.alternatePhoneNumber)}</span>
              </>
            )}
          </div>

          {/* Email and Address */}
          {patient.email && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Email:</span> {patient.email}
            </div>
          )}
          {patient.address && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Address:</span> {patient.address}
            </div>
          )}
        </div>
      </div>

      {/* Medical Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Personal Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm">Personal Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {patient.dateOfBirth && (
              <div><span className="font-medium">Date of Birth:</span> {formatDate(patient.dateOfBirth)}</div>
            )}
            {patient.age && (
              <div><span className="font-medium">Age:</span> {patient.age} years</div>
            )}
            {patient.gender && (
              <div><span className="font-medium">Gender:</span> {patient.gender}</div>
            )}
            {patient.maritalStatus && (
              <div><span className="font-medium">Marital Status:</span> {patient.maritalStatus}</div>
            )}
            {patient.occupation && (
              <div><span className="font-medium">Occupation:</span> {patient.occupation}</div>
            )}
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm">Medical Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {patient.bloodGroup && (
              <div><span className="font-medium">Blood Group:</span> {patient.bloodGroup}</div>
            )}
            {patient.category && (
              <div><span className="font-medium">Category:</span> {patient.category}</div>
            )}
            {patient.allergies && (
              <div><span className="font-medium">Allergies:</span> {patient.allergies}</div>
            )}
            {patient.chronicConditions && (
              <div><span className="font-medium">Chronic Conditions:</span> {patient.chronicConditions}</div>
            )}
            {patient.emergencyContact && (
              <div><span className="font-medium">Emergency Contact:</span> {patient.emergencyContact}</div>
            )}
          </div>
        </div>

        {/* Family Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm">Family Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {patient.spouseName && (
              <div><span className="font-medium">Spouse/Father:</span> {patient.spouseName}</div>
            )}
            {patient.motherName && (
              <div><span className="font-medium">Mother:</span> {patient.motherName}</div>
            )}
            {patient.guardianName && (
              <div><span className="font-medium">Guardian:</span> {patient.guardianName}</div>
            )}
            {patient.guardianPhone && (
              <div><span className="font-medium">Guardian Phone:</span> {formatPhone(patient.guardianPhone)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tags and Additional Info */}
      <div className="space-y-3">
        {/* Medical Tags */}
        <div className="flex flex-wrap gap-2">
          {patient.bloodGroup && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Blood: {patient.bloodGroup}
            </span>
          )}
          {patient.category && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {patient.category}
            </span>
          )}
          {patient.allergies && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Allergies: {patient.allergies}
            </span>
          )}
          {patient.tags && patient.tags.length > 0 && (
            patient.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {tag}
              </span>
            ))
          )}
        </div>

        {/* Additional Information */}
        {(patient.referredBy || patient.insuranceProvider || patient.insuranceNumber) && (
          <div className="pt-3 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 text-sm mb-2">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              {patient.referredBy && (
                <div><span className="font-medium">Referred By:</span> {patient.referredBy}</div>
              )}
              {patient.insuranceProvider && (
                <div><span className="font-medium">Insurance:</span> {patient.insuranceProvider}</div>
              )}
              {patient.insuranceNumber && (
                <div><span className="font-medium">Insurance No:</span> {patient.insuranceNumber}</div>
              )}
            </div>
          </div>
        )}

        {/* Registration Information */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Patient ID: {patient._id}</span>
            {patient.createdAt && (
              <span>Registered: {formatDate(patient.createdAt)}</span>
            )}
            {patient.lastUpdated && (
              <span>Last Updated: {formatDate(patient.lastUpdated)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsCard; 