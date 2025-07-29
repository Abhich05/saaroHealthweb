import React from "react";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const StepFourPage = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header2 />
      <div className="flex flex-1">
        {/* Left side content */}
        <div className="w-1/2 px-10 py-12 flex flex-col justify-center items-center">
          <p className="text-sm mb-2 self-start">Step 4 of 4</p>
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">
            Verification In Progress
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Thank you for submitting your credentials. Our team is currently reviewing your documents to verify your profile. This process typically takes 1–2 business days.
          </p>

          <div className="w-[90%] border-t-4 border-black mb-6"></div>

          <p className="text-xs text-gray-500 mb-8 text-center">
            Contact us or visit our FAQ page if you have any questions.
          </p>

          <Button
            className="w-full max-w-xs h-10  text-white text-sm rounded-full hover:bg-purple-700 transition"
            onClick={() => navigate('/login')}
          >
            Log in
          </Button>
        </div>

        {/* Right side image area */}
        <div className="w-1/2 h-[calc(100vh-80px)] bg-[#fde7d9] flex items-end justify-center">
          <img
            src="/path/to/your/image.png"
            alt="Doctor illustration"
            className="h-full w-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default StepFourPage;
