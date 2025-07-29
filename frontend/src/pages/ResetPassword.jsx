import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from '../components/layout/Header2'; 
import Button from '../components/ui/Button'// your existing Header component
import { FiEye, FiEyeOff } from 'react-icons/fi';


const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

  if (!password) {
  newErrors.password = "Password is required.";
} else if (password.length < 8) {
  newErrors.password = "Password must be at least 8 characters long.";
} else if (!/[A-Z]/.test(password)) {
  newErrors.password = "Password must include at least one uppercase letter.";
} else if (!/[a-z]/.test(password)) {
  newErrors.password = "Password must include at least one lowercase letter.";
} else if (!/[0-9]/.test(password)) {
  newErrors.password = "Password must include at least one number.";
} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  newErrors.password = "Password must include at least one special character.";
}



    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // handle reset password logic
      navigate('/resetsuccess'); // replace with dashboard/success if needed
    }
  };
  const [showPassword, setShowPassword] = useState(false);


  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header2 />

      <div className="flex flex-1">
        {/* Left Form */}
        <div className="w-1/2 flex flex-col justify-center px-16">
          <h2 className="text-xl font-semibold mb-2">Create New Password</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your new password and confirm it below.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-xs">
            <label className="block mb-1 text-sm font-medium">New Password</label>
<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    className={`w-full border rounded-md px-4 py-2 mb-1 text-sm ${
      errors.password ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="Enter your new password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
  >
    {showPassword ? <FiEyeOff /> : <FiEye />}
  </button>
</div>
{errors.password && (
  <p className="text-xs text-red-500 mb-3">{errors.password}</p>
)}


            <label className="block mb-1 text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              className={`w-full border rounded-md px-4 py-2 mb-1 text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mb-3">{errors.confirmPassword}</p>
            )}

            <p className="text-xs text-gray-500 mb-4">
              Password must be at least 8 characters long and include at least one
              uppercase letter, one lowercase letter, one number, and one special character.
            </p>

            <Button
              type="submit"
              className="w-full text-white py-2 rounded-full text-sm"
            >
              Reset Password
            </Button>
          </form>
        </div>

        {/* Right Image Placeholder */}
        <div className="w-1/2 relative">
          <div className="absolute bottom-0 right-0 top-0 w-full h-[100%] bg-gray-300 rounded-tl-xl" />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
