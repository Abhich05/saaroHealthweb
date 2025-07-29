import React, { useState, useEffect } from "react";

const Loading = () => {
  const [currentTagline, setCurrentTagline] = useState(0);
  
  const medicalTaglines = [
    "Caring for your health with precision and compassion",
    "Advanced medical technology at your fingertips",
    "Your health journey starts with us",
    "Empowering healthcare professionals worldwide",
    "Where innovation meets patient care",
    "Streamlining healthcare for better outcomes",
    "Your trusted partner in medical excellence",
    "Transforming healthcare delivery"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % medicalTaglines.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Logo Section */}
      <div className="mb-8">
        <img 
          src="/saaro-health2.png" 
          alt="Saaro Health Logo" 
          className="w-32 h-32 mb-4 animate-pulse" 
        />
      </div>

      {/* Skeleton Loader */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {/* Main skeleton card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex space-x-3 mt-6">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
          </div>
        </div>

        {/* Secondary skeleton cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="relative mb-6">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Tagline Section */}
      <div className="text-center max-w-lg px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Loading Saaro Health
        </h2>
        <div className="h-6 mb-2">
          <p className="text-gray-600 text-sm transition-opacity duration-500">
            {medicalTaglines[currentTagline]}
          </p>
        </div>
        <div className="flex justify-center space-x-1">
          {medicalTaglines.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTagline 
                  ? 'bg-purple-600 scale-125' 
                  : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 bg-gray-200 rounded-full h-1 mt-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Powered by advanced healthcare technology
        </p>
      </div>
    </div>
  );
};

export default Loading; 