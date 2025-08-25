import React from 'react';

const SettingsSkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Profile & Availability Header */}
      <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>

      {/* Profile grid: Left avatar+bio, Right form fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Avatar with camera badge and Bio */}
        <div className="lg:col-span-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
          <div className="relative w-28 h-28 mx-auto">
            <div className="w-28 h-28 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
            <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Right: Two-column fields and Save bar */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1,2,3,4,5].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}

            {/* Save bar */}
            <div className="sm:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full sm:w-36"></div>
            </div>
          </div>
        </div>
      </div>

      {/* OPD & Appointment Timing Management Section */}
      <div className="mt-10">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-80 mb-4"></div>
        
        <div className="flex flex-col md:flex-row justify-around gap-4">
          {/* Left column skeleton */}
          <div className="flex-1 space-y-4">
            {/* Add OPD Location Button */}
            <div className="h-10 bg-gray-200 rounded-full animate-pulse w-40"></div>
            
            {/* Clinic Info */}
            <div className="flex flex-wrap justify-between items-start gap-6 w-full">
              <div className="flex-1 min-w-[200px]">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
              </div>
              <div className="flex-shrink-0 w-full max-w-md">
                <div className="w-[320px] h-[171px] bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
            
            {/* Days of Week */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="w-12 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
            
            {/* Time Grid */}
            <div className="grid grid-cols-2 gap-8 w-1/2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Toggle Section */}
        <div className="mt-6 bg-gray-100 rounded-md p-4 flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeletonLoader; 