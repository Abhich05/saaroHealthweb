import React from "react";
import Header2 from "../components/layout/Header2"; // adjust path if needed
import Button from "../components/ui/Button.jsx"
import { useNavigate } from "react-router-dom";

const OnboardingPage = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      {/* Header */}
      <Header2 />

      {/* Main content */}
      <main className="flex-1 w-full bg-white flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1c1c1c] mb-2 text-center">
          Welcome to Saaro Health
        </h1>

        <p className="text-gray-600 mb-6 max-w-2xl text-center">
          Empowering doctors with robust practice management, streamlined communication, and access to essential resources.
        </p>

        {/* Image placeholder */}
        <div className="w-full max-w-3xl h-[300px] bg-gray-300 rounded-lg mb-6 flex items-center justify-center">
          <span className="text-gray-500">Image Placeholder</span>
        </div>

        <Button className=" text-white text-sm px-6 py-3 rounded-full hover:bg-purple-700 transition" onClick={() => navigate("/signup")}>
          Get Started
        </Button>
      </main>
    </div>
  );
};

export default OnboardingPage;
