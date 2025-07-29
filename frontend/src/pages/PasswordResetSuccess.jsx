import React from "react";
import { Link } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import { FiCheckCircle } from "react-icons/fi";
import Button from "../components/ui/Button";

const PasswordResetSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header2 />

      <div className="flex flex-1">
        {/* Left Success Section */}
        <div className="w-1/2 flex flex-col items-center justify-center items-start px-16">
          <FiCheckCircle className="text-green-500" size={64} />
          <h2 className="text-xl font-semibold mt-4 mb-2">
            Password Successfully Reset!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>

          <Link to="/login">
            <Button className="text-white rounded-full py-2 px-6  text-sm">
              Go to Login Page
            </Button>
          </Link>
        </div>

        {/* Right Placeholder Section */}
        <div className="w-1/2 relative">
          <div className="absolute bottom-0 right-0 top-0 w-full h-[100%] bg-gray-300 rounded-tl-xl" />
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
