import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from '../components/layout/Header2';
import Button from '../components/ui/Button';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60);

  // ✅ Phone validation
  const validatePhone = () => {
    const newErrors = {};
    if (!phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number.';
    }
    return newErrors;
  };

  // ✅ OTP validation
  const validateOTP = () => {
    const newErrors = {};
    if (!otp) {
      newErrors.otp = 'OTP is required.';
    } else if (!/^\d{4}$/.test(otp)) {
      newErrors.otp = 'OTP must be 4 digits.';
    } else if (otp !== '1234') {
      newErrors.otp = 'Invalid OTP. Please enter 1234.';
    }
    return newErrors;
  };

  const handleSendOtp = () => {
    const newErrors = validatePhone();
    if (Object.keys(newErrors).length === 0) {
      setOtpSent(true);
      setErrors({});
      setTimer(60);
    } else {
      setErrors(newErrors);
    }
  };

  const handleLogin = () => {
    const newErrors = validateOTP();
    if (Object.keys(newErrors).length === 0) {
      navigate('/');
    } else {
      setErrors(newErrors);
    }
  };

  // ✅ Timer countdown
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header2 />

      <div className="flex flex-1">
        {/* Left form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 md:px-16 py-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold text-center mb-6">Login with Phone</h2>

            {/* Phone input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className={`w-full border px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {!otpSent && (
              <Button
                onClick={handleSendOtp}
                className="w-full text-white py-2 rounded-full text-sm transition hover:scale-[1.02]"
              >
                Send OTP
              </Button>
            )}

            {/* OTP section */}
            {otpSent && (
              <div className="mt-6">
                <label className="block text-sm font-medium mb-1">Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className={`w-full border px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}

                <p className="text-xs text-gray-500 mt-3">
                  OTP sent to your WhatsApp ending with {phone.slice(-4) || 'XXXX'}
                </p>
                <p className="text-xs text-gray-500">
                  Code expires in 0:{String(timer).padStart(2, '0')}
                </p>

                <Button
                  onClick={handleLogin}
                  className="w-full mt-4 text-white py-2 rounded-full text-sm transition hover:scale-[1.02]"
                >
                  Login
                </Button>

                <div className="flex justify-center mt-3">
                  <button
                    onClick={handleSendOtp}
                    disabled={timer > 0}
                    className={`text-sm underline ${
                      timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-500 hover:text-purple-700'
                    }`}
                  >
                    Resend OTP {timer > 0 && `in ${timer}s`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right image */}
        <div className="hidden md:block w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 to-purple-400 flex items-center justify-center rounded-tl-3xl">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2950/2950656.png"
              alt="Phone Login"
              className="w-48 h-48 opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;
