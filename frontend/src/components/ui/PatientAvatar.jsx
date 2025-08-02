import React from 'react';

const PatientAvatar = ({ patient, size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const getDefaultAvatar = (gender) => {
    if (gender === 'Female') {
      return (
        <div className={`${sizeClasses[size]} bg-pink-100 rounded-full flex items-center justify-center ${className}`}>
          <svg className="w-3/4 h-3/4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center ${className}`}>
          <svg className="w-3/4 h-3/4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  if (patient?.photo) {
    return (
      <img
        src={patient.photo}
        alt={`${patient.fullName || patient.name}`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return getDefaultAvatar(patient?.gender);
};

export default PatientAvatar; 