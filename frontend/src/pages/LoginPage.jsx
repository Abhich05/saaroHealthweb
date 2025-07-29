import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import axiosInstance from "../api/axiosInstance";


const LoginPage = () => {
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
        const res = await axiosInstance.post("/doctor/access-token", {
          email,
          password,
        });
        if (res.data) {
          // Support both { doctorId } and { doctor: { id } }
          const doctorId = res.data.doctorId || (res.data.doctor && res.data.doctor.id);
          if (doctorId) {
            localStorage.setItem('doctorId', doctorId);
            localStorage.setItem('isUserLogin', 'false'); // Mark as doctor login
            
            // Store JWT token from response body
            if (res.data.accessToken) {
              localStorage.setItem('jwt_token', res.data.accessToken);
              console.log('JWT token stored in localStorage from response');
            }
            
            // Also try to get from cookie as backup
            const jwtToken = document.cookie
              .split('; ')
              .find(row => row.startsWith('jwt_token='))
              ?.split('=')[1];
            
            if (jwtToken && !res.data.accessToken) {
              localStorage.setItem('jwt_token', jwtToken);
              console.log('JWT token stored in localStorage from cookie');
            }
            
            console.log('doctorId set:', doctorId); // Debug statement
            navigate('/'); // Navigate to dashboard instead of reloading
          }
        }
      } catch (err) {
        setSubmitError(err.response?.data?.error || "Login failed. Please try again.");
      }
    }
  };
  
  const handleForgotPasswordClick = () => {
    navigate('/forgot'); // replace with your actual route
  };

  const handleUserLogin = () => {
    navigate('/user-login'); // Navigate to user login
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <Header2 />

      <div className="flex flex-1 relative">
        {/* Left form section */}
        <div className="w-1/2 flex items-center justify-center px-10 py-12">
          <div className="w-full max-w-sm">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
              Doctor Login
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

            <p
              className="text-xs text-purple-600 mb-4 cursor-pointer hover:underline"
              onClick={handleForgotPasswordClick}
            >
              Forgot Password?
            </p>

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
              Need an account?{" "}
              <span
                className="text-purple-600 cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </p>

            <p className="text-xs text-center mt-1">
              Are you a staff member?{" "}
              <span
                className="text-purple-600 cursor-pointer hover:underline"
                onClick={handleUserLogin}
              >
                Staff Login
              </span>
            </p>

            <p
              className="text-xs text-center text-purple-600 cursor-pointer mt-1 hover:underline"
              onClick={() => navigate("/phonelogin")}
            >
              Login With Phone
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

export default LoginPage;