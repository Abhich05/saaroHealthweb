import React, { useState, useEffect } from "react";

// Full Page Loading Component (for initial app loading)
const Loading = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`fixed inset-0 bg-white z-50 transition-transform duration-1000 ease-out ${isVisible ? 'translate-x-full' : 'translate-x-0'}`}></div>
      
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className={`mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img 
            src="/saaro-health2.png" 
            alt="Saaro Health Logo" 
            className="w-28 h-28 animate-pulse" 
          />
        </div>

        <div className={`w-full max-w-4xl px-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex space-x-6 mb-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((card) => (
              <div key={card} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-24"></div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="flex items-center space-x-4 py-3 border-b border-gray-50 last:border-b-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Loading Component
export const TableLoader = ({ rows = 5, columns = 4, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-24"></div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4 py-3 border-b border-gray-50 last:border-b-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: columns - 2 }).map((_, colIndex) => (
                  <div key={colIndex} className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// KPI Loading Component
export const KPILoader = ({ count = 3, className = "" }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative rounded-2xl p-4 shadow-lg bg-gradient-to-b from-white to-purple-20 flex flex-col justify-between h-48 overflow-hidden">
          <div className="flex items-center justify-between mb-3 z-10 relative">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="z-10 relative space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
          <div className="absolute top-12 bottom-5 right-2 w-28 h-28">
            <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Graph Loading Component
export const GraphLoader = ({ className = "" }) => {
  return (
    <div className={`p-4 border rounded-xl ${className}`}>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Card Loading Component
export const CardLoader = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>
    </div>
  );
};

// Spinner Component
export const Spinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-purple-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

// Skeleton Text Component
export const SkeletonText = ({ lines = 1, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className={`h-4 bg-gray-200 rounded animate-pulse ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        ></div>
      ))}
    </div>
  );
};

export default Loading; 