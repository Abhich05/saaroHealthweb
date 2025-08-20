import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import axios from "axios";
import { setDoctorToken } from "../utils/auth";

// Create a dedicated axios instance for login to avoid interceptors
const loginAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://saarohealthweb-1.onrender.com/api',
  timeout: 10000,
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Preload assets on component mount
  useEffect(() => {
    // Preload the dashboard route
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    
    return newErrors;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    const newErrors = validateForm();
    setErrors(newErrors);
    setSubmitError("");

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    
    try {
      // Clear previous session data
      ['doctorName', 'userName', 'userRole', 'userPermissions', 'userId', 'clinicName']
        .forEach(key => localStorage.removeItem(key));

      // Use the login-specific axios instance
      const { data } = await loginAxios.post("/doctor/access-token", {
        email,
        password,
      }, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        retry: true, // Enable retry for this request
        'axios-retry': {
          retries: 2,
          retryDelay: (retryCount) => {
            return retryCount * 1000; // 1s, 2s delay between retries
          }
        }
      });

      if (data?.accessToken) {
        const doctorId = data.doctorId || (data.doctor && data.doctor.id);
        if (doctorId) {
          // Batch localStorage operations
          const storageUpdates = [
            ['doctorId', doctorId],
            ['isUserLogin', 'false']
          ];
          
          storageUpdates.forEach(([key, value]) => 
            localStorage.setItem(key, value)
          );
          
          setDoctorToken(data.accessToken);
          
          // Use replace instead of href to prevent adding to history
          window.location.replace('/');
          return;
        }
      }
      
      setSubmitError("Invalid response from server. Please try again.");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed. Please try again.";
      setSubmitError(errorMessage);
      
      // Clear form on specific errors
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validateForm]);

  const handleForgotPasswordClick = () => {
    navigate("/forgot");
  };

  const handleUserLogin = () => {
    navigate("/user-login");
  };

  // Debounce form submission
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Memoize the debounced login
  const debouncedLogin = useCallback(
    debounce(handleLogin, 300),
    [handleLogin]
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      debouncedLogin();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-purple-50 flex flex-col relative">
        <Header2 />

        <div className="flex flex-1 relative">
          {/* Left Section - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 relative z-10">
            <div className="w-full max-w-md">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-lg">
                  Sign in to your doctor account
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="doctor@example.com"
                      value={email}
                      onChange={(e) => {
                        setErrors((prev) => ({ ...prev, email: "" }));
                        setEmail(e.target.value);
                      }}
                      onKeyPress={handleKeyPress}
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl bg-white/80 backdrop-blur-sm 
                        focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-200
                        hover:bg-white hover:shadow-sm ${
                        errors.email ? "border-red-400 bg-red-50/50" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-2">
                      <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setErrors((prev) => ({ ...prev, password: "" }));
                        setPassword(e.target.value);
                      }}
                      onKeyPress={handleKeyPress}
                      className={`w-full pl-12 pr-12 py-4 text-base border-2 rounded-xl bg-white/80 backdrop-blur-sm 
                        focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-200
                        hover:bg-white hover:shadow-sm ${
                        errors.password ? "border-red-400 bg-red-50/50" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center mt-2">
                      <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    </div>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline transition-colors"
                    onClick={handleForgotPasswordClick}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 
                    text-white rounded-xl py-4 text-base font-semibold shadow-lg hover:shadow-xl 
                    transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 
                    disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign In</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </Button>

                {/* Error Message */}
                {submitError && (
                  <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-xl">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm font-medium">{submitError}</p>
                  </div>
                )}
              </div>

              {/* Alternative Login Options */}
              <div className="mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-purple-50 text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl 
                      hover:border-purple-300 hover:bg-purple-100 transition-all duration-200 group"
                    onClick={() => navigate("/phonelogin")}
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Phone</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl 
                      hover:border-purple-300 hover:bg-purple-100 transition-all duration-200 group"
                    onClick={handleUserLogin}
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Staff</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
                    onClick={() => navigate("/signup")}
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Hero Image/Content */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-700"></div>
            
            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 bg-purple-300/20 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-300/20 rounded-full blur-md"></div>

            <div className="relative z-10 flex flex-col justify-center items-center text-center p-16">
              <div className="ml-20 mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Secure Healthcare Portal
                </h2>
                <p className="text-xl text-purple-100 leading-relaxed max-w-md">
                  Access your practice management tools with enterprise-grade security and seamless user experience.
                </p>
              </div>

              <div className="space-y-4 text-purple-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>HIPAA Compliant Platform</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 Technical Support</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced Analytics & Reports</span>
                </div>
              </div>
            </div>

            {/* Medical Icons Pattern */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;