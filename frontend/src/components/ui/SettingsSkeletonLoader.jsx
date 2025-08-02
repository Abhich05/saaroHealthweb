import React from 'react';

const SettingsSkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Profile & Availability Header */}
      <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
      
      {/* Profile Picture Section */}
      <div className="flex items-center gap-4">
        <div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
          
          {/* Avatar Preview Skeleton */}
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
          {/* Upload Section Skeleton */}
          <div className="mb-6 max-w-lg border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Form Fields Skeleton */}
      <div className="flex flex-col gap-6">
        {[1, 2, 3, 4, 5, 6].map((field) => (
          <div key={field}>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Bio Section Skeleton */}
      <div className="mt-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
        <div className="h-28 bg-gray-200 rounded-lg animate-pulse w-1/2"></div>
      </div>

      {/* Save Button Skeleton */}
      <div className="mt-6">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
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