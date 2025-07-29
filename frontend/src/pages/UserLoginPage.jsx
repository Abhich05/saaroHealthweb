import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import axiosInstance from "../api/axiosInstance";

const UserLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleLogin = async () => {
    let newErrors = {};
    setSubmitError("");
    if (!email) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email.";
      }
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        console.log('Attempting login with:', { email, password: '***' });
        
        const res = await axiosInstance.post("/user/login", {
          email,
          password,
        });
        
        console.log('Login response:', res.data);
        
        if (res.data && res.data.user) {
          // Store user information
          localStorage.setItem('userId', res.data.user.id);
          localStorage.setItem('userName', res.data.user.name);
          localStorage.setItem('userRole', res.data.user.role);
          localStorage.setItem('userPermissions', JSON.stringify(res.data.user.permissions));
          localStorage.setItem('doctorId', res.data.user.doctorId);
          localStorage.setItem('doctorName', res.data.user.doctorName);
          localStorage.setItem('clinicName', res.data.user.clinicName);
          localStorage.setItem('isUserLogin', 'true');
          
          console.log('User logged in successfully:', res.data.user);
          navigate('/'); // Navigate to dashboard
        }
      } catch (err) {
        console.error('Login error:', err);
        console.error('Error response:', err.response?.data);
        setSubmitError(err.response?.data?.error || "Login failed. Please try again.");
      }
    }
  };

  const handleDoctorLogin = () => {
    navigate('/login'); // Navigate to doctor login
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <Header2 />

      <div className="flex flex-1 relative">
        {/* Left form section */}
        <div className="w-1/2 flex items-center justify-center px-10 py-12">
          <div className="w-full max-w-sm">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
              Staff Login
            </h2>

            <div className="mb-4">
              <p className="text-sm mb-1">Email Address</p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setEmail(e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-xl bg-[#c5c7c9] bg-opacity-20 text-sm focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-1">
              <p className="text-sm mb-1">Password</p>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, password: "" }));
                  setPassword(e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-xl bg-[#c5c7c9] bg-opacity-20 text-sm focus:outline-none"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              className="w-full text-white rounded-full py-2 text-sm hover:bg-purple-700 transition"
              onClick={handleLogin}
            >
              Log In
            </Button>

            {submitError && (
              <p className="text-red-500 text-xs mt-2">{submitError}</p>
            )}

            <p className="text-xs text-center mt-3">
              Are you a doctor?{" "}
              <span
                className="text-purple-600 cursor-pointer hover:underline"
                onClick={handleDoctorLogin}
              >
                Doctor Login
              </span>
            </p>
          </div>
        </div>

        {/* Right image section fixed to right bottom */}
        <div className="w-1/2 hidden md:block relative">
          <div className="absolute top-0 bottom-0 right-0 w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Image Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage; 