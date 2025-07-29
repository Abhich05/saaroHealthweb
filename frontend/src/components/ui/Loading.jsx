import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <img src="/saaro-health2.png" alt="Saaro Health Logo" className="w-40 h-40 mb-6 animate-bounce" />
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-8 border-[#7042D9] border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-2xl font-semibold text-[#7042D9] mb-2">Loading...</h2>
      <p className="text-gray-600">Please wait while we prepare your experience.</p>
    </div>
  );
};

export default Loading; 