import React, { useState } from "react";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SignupStepsPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    rmcNumber: "",
    address: "",
    clinicName: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Step 1 validation
  const validateStep1 = () => {
    const newErrors = {};
    const { fullName, email, mobile, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format.";
    if (!mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(mobile)) newErrors.mobile = "Mobile number must be exactly 10 digits.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 validation
  const validateStep2 = () => {
    const newErrors = {};
    const { rmcNumber, address } = formData;
    if (!rmcNumber.trim()) newErrors.rmcNumber = "RMC Number is required.";
    if (!address.trim() || address.length < 5) newErrors.address = "Address must have at least 5 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setProgress(50);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(1);
    setProgress(0);
    setErrors({});
  };

  const handleSignUp = async () => {
    if (validateStep2()) {
      setSubmitError("");
      try {
        await axiosInstance.post("/doctor", {
          name: formData.fullName,
          email: formData.email,
          phoneNumber: formData.mobile,
          password: formData.password,
          rmcNumber: formData.rmcNumber,
          address: formData.address,
          clinicName: formData.clinicName,
        });
        navigate("/login");
      } catch (err) {
        setSubmitError(err.response?.data?.error || "Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      <Header2 />

      <main className="flex-1 flex flex-col md:flex-row bg-white">
        {/* Left Form Section */}
        <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
          <div className="w-full max-w-sm">
            <p className="text-sm mb-1">Step {step} of 2</p>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Create your account</h2>
            {submitError && <p className="text-red-500 text-base mb-2">{submitError}</p>}
            <div className="space-y-3">
              {step === 1 && (
                <>
                  {/* Full Name */}
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  {/* Mobile */}
                  <div>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter your mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                  {/* Password */}
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  {/* RMC Number */}
                  <div>
                    <input
                      type="text"
                      name="rmcNumber"
                      placeholder="Enter your RMC Number"
                      value={formData.rmcNumber}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.rmcNumber && <p className="text-red-500 text-xs mt-1">{errors.rmcNumber}</p>}
                  </div>
                  {/* Address */}
                  <div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  {/* Clinic Name (optional) */}
                  <div>
                    <input
                      type="text"
                      name="clinicName"
                      placeholder="Enter your clinic name (optional)"
                      value={formData.clinicName}
                      onChange={handleChange}
                      className="w-full border p-2 rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Step navigation buttons */}
            <div className="flex gap-2 mt-6">
              {step === 2 && (
                <Button onClick={handleBack} className="w-1/2 text-white rounded-full py-2 text-sm bg-gray-400 hover:bg-gray-500">Back</Button>
              )}
              {step === 1 && (
                <Button onClick={handleNext} className="w-full text-white rounded-full py-2 text-sm hover:bg-purple-700 transition">Next</Button>
              )}
              {step === 2 && (
                <Button onClick={handleSignUp} className="w-1/2 text-white rounded-full py-2 text-sm hover:bg-purple-700 transition">Sign Up</Button>
              )}
            </div>
            <p className="text-sm mt-3">
              Already have an account?{" "}
              <span
                onClick={() => navigate('/login')}
                className="text-purple-600 underline cursor-pointer"
              >
                Log in
              </span>
            </p>
            {/* Progress Bar */}
            <div className="mt-5">
              <p className="text-xs mb-1">Verification Progress</p>
              <div className="w-full bg-gray-300 h-2 rounded">
                <div
                  className="bg-black h-2 rounded transition-all duration-300"
                  style={{ width: `${step === 1 ? 50 : 100}%` }}
                />
              </div>
              <p className="text-xs mt-1">{step === 1 ? 50 : 100}%</p>
            </div>
          </div>
        </div>

  {/* Right Image Section */}
  <div className="hidden md:block w-1/2 bg-[#fde4d2] flex items-center justify-center">
    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
      <span className="text-gray-500">Image Placeholder</span>
    </div>
  </div>
</main>

    </div>
  );
};

export default SignupStepsPage;
