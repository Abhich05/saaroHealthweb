import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            className="w-full text-white rounded-md py-2 hover:bg-purple-700 transition"
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          
          <Button
            className="w-full bg-gray-200 text-gray-800 rounded-md py-2 hover:bg-gray-300 transition"
            onClick={handleGoHome}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 