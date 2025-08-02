import React from 'react';

const ConsultSkeletonLoader = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-gray-100 animate-pulse"></div>
      
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="h-16 bg-gray-100 animate-pulse"></div>
        
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="max-w-6xl mx-auto space-y-6 font-sans text-sm">
              
              {/* Header section skeleton */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Patient info section skeleton */}
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="w-[300px] h-[160px] bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Vitals grid skeleton */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Consultation sections skeleton */}
              {[1, 2, 3, 4, 5].map((section) => (
                <div key={section} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
              
              {/* Action buttons skeleton */}
              <div className="flex gap-4 mt-4">
                <div className="w-32 h-10 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-48 h-10 bg-gray-200 rounded-2xl animate-pulse ml-auto"></div>
              </div>
              
              {/* Past prescriptions skeleton */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultSkeletonLoader; 