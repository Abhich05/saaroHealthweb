import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from '../components/layout/Header2';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("whatsapp"); // default active
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validateInput = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!value.trim()) {
      return "This field is required.";
    }

    if (phoneRegex.test(value)) {
      return ""; // valid phone
    }

    if (emailRegex.test(value)) {
      return ""; // valid email
    }

    return "Please enter a valid email or 10-digit phone number.";
  };

  const handleClick = (method) => {
    // First, set which button is active regardless of validation
    setActiveButton(method);

    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    let message = "";
    if (method === "whatsapp") {
      message = "We have sent a verification code to your WhatsApp number at ***79. Please enter it below.";
    } else {
      message = "We have sent a verification code to your email at j***@example.com. Please enter it below.";
    }

    navigate("/verify", { state: { message } });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header2 />

      <div className="flex flex-1">
        {/* Form Section */}
        <div className="w-1/2 flex flex-col justify-center items-center px-16">
          <h2 className="text-xl font-semibold mb-2 text-center">Forgot Password</h2>
          <p className="text-sm text-gray-600  mb-6 text-center">
            Enter your registered email address/phone number to receive a verification code.
          </p>
          <input
  type="text"
  placeholder="your@email.com / 9999988889"
  value={inputValue}
  onChange={(e) => {
    setInputValue(e.target.value);
    setError("");
  }}
  className={`w-full max-w-xs border rounded-md px-4 py-2 mb-1 text-sm focus:outline-none
    ${error ? "border-red-500" : "border-gray-300"}
  `}
/>

          {error && (
            <p className="text-red-500 text-xs mb-2">{error}</p>
          )}

          <button
            onClick={() => handleClick("whatsapp")}
            className={`w-full max-w-xs py-2 rounded-full mt-2 mb-3 text-sm transition
              ${activeButton === "whatsapp" ? "bg-[#7047d1] text-white" : "bg-gray-200 text-black"}
            `}
          >
            Send OTP on WhatsApp
          </button>

          <button
            onClick={() => handleClick("email")}
            className={`w-full max-w-xs py-2 rounded-full text-sm transition
              ${activeButton === "email" ? "bg-[#7047d1]  text-white" : "bg-gray-200 text-black"}
            `}
          >
            Send OTP on Email
          </button>
        </div>

        {/* Image Placeholder */}
        <div className="w-1/2 relative">
          <div className="absolute bottom-0 right-0 top-0 w-full h-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
