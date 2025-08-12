import React, { useState } from "react";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SignupStepsPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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

  const validateStep1 = () => {
    const newErrors = {};
    const { fullName, email, mobile, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format.";
    if (!mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(mobile)) newErrors.mobile = "Must be exactly 10 digits.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Min 8 characters.";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const { rmcNumber, address } = formData;
    if (!rmcNumber.trim()) newErrors.rmcNumber = "RMC Number is required.";
    if (!address.trim() || address.length < 5) newErrors.address = "At least 5 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(1);
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
        setSubmitError(err.response?.data?.error || "Failed to create account. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex flex-col">
      <Header2 />

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Step {step} of 2</p>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Create your account
            </h2>

            {submitError && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg border border-red-200">
                {submitError}
              </p>
            )}

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <InputField name="fullName" label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
                  <InputField name="email" label="Email" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} />
                  <InputField name="mobile" label="Mobile" placeholder="10-digit number" value={formData.mobile} onChange={handleChange} error={errors.mobile} />
                  <InputField type="password" name="password" label="Password" placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password} />
                  <InputField type="password" name="confirmPassword" label="Confirm Password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                </>
              )}

              {step === 2 && (
                <>
                  <InputField name="rmcNumber" label="RMC Number" placeholder="RMC12345" value={formData.rmcNumber} onChange={handleChange} error={errors.rmcNumber} />
                  <InputField name="address" label="Address" placeholder="Street, City" value={formData.address} onChange={handleChange} error={errors.address} />
                  <InputField name="clinicName" label="Clinic Name (Optional)" placeholder="Healthy Life Clinic" value={formData.clinicName} onChange={handleChange} />
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {step === 2 && (
                <Button
                  onClick={handleBack}
                  className="w-1/2 text-white rounded-full py-2 text-sm bg-gray-400 hover:bg-gray-500 transition"
                >
                  Back
                </Button>
              )}
              {step === 1 && (
                <Button
                  onClick={handleNext}
                  className="w-full bg-purple-600 text-white rounded-full py-2 text-sm hover:bg-purple-700 transition"
                >
                  Next
                </Button>
              )}
              {step === 2 && (
                <Button
                  onClick={handleSignUp}
                  className="w-1/2 bg-purple-600 text-white rounded-full py-2 text-sm hover:bg-purple-700 transition"
                >
                  Sign Up
                </Button>
              )}
            </div>

            <p className="text-sm mt-4 text-gray-600 text-center">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-purple-600 font-semibold hover:underline cursor-pointer"
              >
                Log in
              </span>
            </p>

            {/* Progress */}
            <div className="mt-6">
              <p className="text-xs mb-1 text-gray-500">Verification Progress</p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-orange-400 h-2 transition-all duration-500"
                  style={{ width: `${step === 1 ? 50 : 100}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-gray-500">{step === 1 ? 50 : 100}%</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 items-center justify-center p-6">
          <img
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80"
            alt="Doctor signup illustration"
            className="rounded-2xl shadow-2xl w-full h-full object-cover"
          />
        </div>
      </main>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      {...props}
      className={`w-full border p-2 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none transition ${
        error ? "border-red-400" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default SignupStepsPage;
