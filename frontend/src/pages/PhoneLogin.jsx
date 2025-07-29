import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from '../components/layout/Header2';
import Button from '../components/ui/Button' // your existing Header

const PhoneLogin = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60);

  const validatePhone = () => {
    const newErrors = {};
    if (!phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number.';
    }
    return newErrors;
  };

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
      navigate('/'); // or wherever you want after login
    } else {
      setErrors(newErrors);
    }
  };

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header2 />

      <div className="flex flex-1">
        {/* Left form */}
        <div className="w-1/2 flex flex-col items-center justify-center px-16">
          <h2 className="text-xl text-center font-semibold mb-4">Login with Phone</h2>

          {/* Phone input */}
       {/* Phone input */}
<div className="w-full max-w-xs">
  <label className="block text-sm font-medium mb-1">Phone Number</label>
  <input
    type="tel"
    placeholder="Enter your phone number"
    className={`w-full border px-4 py-2 rounded-md text-sm mb-1 ${
      errors.phone ? 'border-red-500' : 'border-gray-300'
    }`}
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />
  {errors.phone && <p className="text-xs text-red-500 mb-3">{errors.phone}</p>}

  {/* ✅ Centered Send OTP button */}
  <div className="flex justify-center">
    <Button
      onClick={handleSendOtp}
      className="w-30 text-white py-2 rounded-full text-sm mb-8"
    >
      Send OTP
    </Button>
  </div>
</div>

          

          {/* OTP input section */}
          {otpSent && (
  <div className="w-full max-w-xs">
    <label className="block text-sm font-medium mb-1">Enter OTP</label>
    <input
      type="text"
      placeholder="Enter OTP"
      className={`w-full border px-4 py-2 rounded-md text-sm mb-1 ${
        errors.otp ? 'border-red-500' : 'border-gray-300'
      }`}
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
    />
    {errors.otp && <p className="text-xs text-red-500 mb-2">{errors.otp}</p>}
    <p className="text-xs text-gray-500 mb-2">
      OTP sent to your WhatsApp number ending with {phone.slice(-4) || '1234'}
    </p>
    <p className="text-xs text-gray-500 mb-4">
      Code expires in 0:{String(timer).padStart(2, '0')}
    </p>

    {/* ✅ Centered Login button */}
    <div className="flex justify-center">
      <Button
        onClick={handleLogin}
        className="w-full text-white py-2 rounded-md text-sm mb-2"
      >
        Login
      </Button>
    </div>

    {/* ✅ Centered Resend OTP button */}
    <div className="flex justify-center">
      <button className="text-sm text-purple-500 underline">
        Resend OTP
      </button>
    </div>
  </div>
)}

        </div>

        {/* Right image placeholder */}
        <div className="w-1/2 relative">
          <div className="absolute bottom-0 top-0 right-0 w-full h-[100%] bg-gray-300 rounded-tl-xl" />
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;
