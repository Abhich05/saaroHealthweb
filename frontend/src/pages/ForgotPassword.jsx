import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("whatsapp"); // default active
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validateInput = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!value.trim()) return "This field is required.";
    if (phoneRegex.test(value)) return "";
    if (emailRegex.test(value)) return "";
    return "Please enter a valid email or 10-digit phone number.";
  };

  const handleClick = (method) => {
    setActiveButton(method);

    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    let message = "";
    if (method === "whatsapp") {
      message =
        "We have sent a verification code to your WhatsApp number at ***79. Please enter it below.";
    } else {
      message =
        "We have sent a verification code to your email at j***@example.com. Please enter it below.";
    }

    navigate("/verify", { state: { message } });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header2 />

      <div className="flex flex-1 items-center justify-center p-6">
        {/* Card Container */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full">
          {/* Left Form */}
          <div className="flex flex-col justify-center items-center px-8 py-10 md:w-1/2">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter your registered email address or phone number to receive a
              verification code.
            </p>

            <input
              type="text"
              placeholder="your@email.com / 9999988889"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError("");
              }}
              className={`w-full border rounded-lg px-4 py-2 mb-2 text-sm focus:outline-none focus:ring-2 transition
                ${
                  error
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-purple-300"
                }
              `}
            />

            {error && (
              <p className="text-red-500 text-xs mb-2">{error}</p>
            )}

            <button
              onClick={() => handleClick("whatsapp")}
              className={`w-full py-2 rounded-full mt-2 mb-3 text-sm font-medium shadow-sm transition-all duration-200
                ${
                  activeButton === "whatsapp"
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }
              `}
            >
              Send OTP on WhatsApp
            </button>

            <button
              onClick={() => handleClick("email")}
              className={`w-full py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-200
                ${
                  activeButton === "email"
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }
              `}
            >
              Send OTP on Email
            </button>
          </div>

          {/* Right Side Image */}
          <div className="md:w-1/2 hidden md:block bg-gray-200 relative">
            <img
              src="/images/forgot-password-illustration.svg"
              alt="Forgot Password Illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
