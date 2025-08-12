import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import axiosInstance from "../api/axiosInstance";
import { setUserToken } from "../utils/auth";

const UserLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      try {
        const res = await axiosInstance.post("/user/login", { email, password });
        if (res.data && res.data.user) {
          localStorage.setItem("userId", res.data.user.id);
          localStorage.setItem("userName", res.data.user.name);
          localStorage.setItem("userRole", res.data.user.role);
          localStorage.setItem("userPermissions", JSON.stringify(res.data.user.permissions));
          localStorage.setItem("doctorId", res.data.user.doctorId);
          localStorage.setItem("doctorName", res.data.user.doctorName);
          localStorage.setItem("clinicName", res.data.user.clinicName);
          localStorage.setItem("isUserLogin", "true");

          if (res.data.accessToken) {
            setUserToken(res.data.accessToken);
          }
          navigate("/");
        }
      } catch (err) {
        setSubmitError(err.response?.data?.error || "Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDoctorLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      <Header2 />

      <div className="flex flex-1">
        {/* Left form section */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Staff Login
            </h2>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setEmail(e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, password: "" }));
                  setPassword(e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <Button
              className="w-full bg-purple-600 text-white rounded-full py-2 text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging In...
                </div>
              ) : (
                "Log In"
              )}
            </Button>

            {submitError && (
              <p className="text-red-500 text-xs mt-2">{submitError}</p>
            )}

            <p className="text-xs text-center mt-4 text-gray-600">
              Are you a doctor?{" "}
              <span
                className="text-purple-600 font-medium hover:underline cursor-pointer"
                onClick={handleDoctorLogin}
              >
                Doctor Login
              </span>
            </p>
          </div>
        </div>

        {/* Right image section */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-8">
          <img
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80"
            alt="Medical staff illustration"
            className="rounded-2xl shadow-2xl w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
