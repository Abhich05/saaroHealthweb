import React, { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";

const VerifyAccountPage = ({ message }) => {
   const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // Get message from state, fallback if not present
  message = location.state?.message || "Default verification message.";

  const handleVerify = () => {
    if (otp === "1234") {
      navigate("/reset"); // Replace with your route
    } else {
      setError("Incorrect OTP. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header2 />
      <div className="flex flex-1">
        {/* Left form area */}
        <div className="w-1/2 px-10 py-12 flex flex-col justify-center items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">Verify Your Account</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            {message}
          </p>
          <input
            type="text"
            placeholder="Verification Code"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            className="w-60 px-3 py-2 border rounded-xl bg-[#c5c7c9] bg-opacity-20 text-sm focus:outline-none mb-4"
          />
          {error && (
            <p className="text-red-500 text-xs mb-2">{error}</p>
          )}
          <div className="flex gap-4 mb-4">
            <div className="w-16 h-12 bg-[#f2f2f2] flex flex-col justify-center items-center rounded-md">
              <p className="text-sm font-semibold">00</p>
              <p className="text-[10px] text-gray-500">Minutes</p>
            </div>
            <div className="w-16 h-12 bg-[#f2f2f2] flex flex-col justify-center items-center rounded-md">
              <p className="text-sm font-semibold">00</p>
              <p className="text-[10px] text-gray-500">Seconds</p>
            </div>
          </div>
          <Button
            className="w-60 text-white rounded-full mt-2 py-2 text-sm hover:bg-purple-700 transition"
            onClick={handleVerify}
          >
            Verify OTP
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2 cursor-pointer hover:underline">Resend Code</p>
        </div>

        {/* Right image area */}
        <div className="w-1/2 h-[calc(100vh-80px)] bg-[#fde7d9] flex items-end justify-end">
          <img
            src="/path/to/your/image.png"
            alt="Doctor illustration"
            className="h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyAccountPage;
