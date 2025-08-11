import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import LandingSections from "../components/landing/LandingSections";
import Button from "../components/ui/Button";
import axiosInstance from "../api/axiosInstance";
import { setDoctorToken } from "../utils/auth";

const LoginPage = () => {
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
        localStorage.removeItem("doctorName");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userPermissions");
        localStorage.removeItem("userId");
        localStorage.removeItem("clinicName");

        const res = await axiosInstance.post("/doctor/access-token", {
          email,
          password,
        });

        if (res.data) {
          const doctorId =
            res.data.doctorId || (res.data.doctor && res.data.doctor.id);
          if (doctorId) {
            localStorage.setItem("doctorId", doctorId);
            localStorage.setItem("isUserLogin", "false");

            if (res.data.accessToken) {
              setDoctorToken(res.data.accessToken);
              console.log(
                "JWT token stored using auth utility from response body"
              );
            }

            const cookieToken = document.cookie
              .split("; ")
              .find((row) => row.startsWith("jwt_token="))
              ?.split("=")[1];

            if (cookieToken) {
              console.log("JWT token also found in cookie from backend");
            } else {
              console.log("No JWT token found in cookie from backend");
            }

            console.log("doctorId set:", doctorId);
            window.location.href = "/";
          }
        }
      } catch (err) {
        setSubmitError(
          err.response?.data?.error || "Login failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPasswordClick = () => {
    navigate("/forgot");
  };

  const handleUserLogin = () => {
    navigate("/user-login");
  };

  return (
    <>

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col relative overflow-hidden">
      <Header2 />

      <div className="flex flex-1 flex-col lg:flex-row relative">
        {/* Left form section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 py-12 bg-white shadow-md lg:shadow-none">
          <div className="w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">
              Doctor Login
            </h2>

            <div className="mb-5">
              <label className="text-sm font-medium mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setEmail(e.target.value);
                }}
                className={`w-full px-4 py-2 border rounded-xl bg-gray-100 bg-opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium mb-1 block">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, password: "" }));
                  setPassword(e.target.value);
                }}
                className={`w-full px-4 py-2 border rounded-xl bg-gray-100 bg-opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <p
              className="text-xs text-purple-600 mb-5 cursor-pointer hover:underline"
              onClick={handleForgotPasswordClick}
            >
              Forgot Password?
            </p>

            <Button
              className="w-full text-white rounded-full py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-red-500 text-xs mt-3 text-center">
                {submitError}
              </p>
            )}

            <p className="text-xs text-center mt-4 text-gray-600">
              Need an account?{" "}
              <span
                className="text-purple-600 cursor-pointer hover:underline font-medium"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </p>

            <p className="text-xs text-center mt-2 text-gray-600">
              Are you a staff member?{" "}
              <span
                className="text-purple-600 cursor-pointer hover:underline font-medium"
                onClick={handleUserLogin}
              >
                Staff Login
              </span>
            </p>

            <p
              className="text-xs text-center text-purple-600 cursor-pointer mt-2 hover:underline font-medium"
              onClick={() => navigate("/phonelogin")}
            >
              Login With Phone
            </p>
          </div>
        </div>

        {/* Right image section */}
        <div className="w-full lg:w-1/2 hidden lg:flex relative">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-purple-100 to-purple-200">
            <span className="text-gray-500 text-lg font-medium">
              Image Placeholder
            </span>
          </div>
        </div>
      </div>
    </div>
    <LandingSections />
    </>

  );
};

export default LoginPage;
