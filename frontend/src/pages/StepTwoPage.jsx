import React, { useState } from "react";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const StepTwoPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    specialization: "",
    regNumber: "",
    clinicName: "",
    address: "",
    location: "",
    locality: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(25); // Start with 25% from step 1

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.specialization) newErrors.specialization = "Specialization is required.";
    if (!formData.regNumber.trim()) newErrors.regNumber = "Registration number is required.";
    if (!formData.clinicName.trim()) newErrors.clinicName = "Clinic/Hospital name is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.locality.trim()) newErrors.locality = "Locality is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setProgress(50);
      navigate("/step3");
      console.log("Profile completed:", formData);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header2 />
      <div className="relative flex flex-col md:flex-row items-center justify-between max-w-full mx-auto">
<div className="w-full max-w-[600px] flex flex-col items-center px-4 py-10 z-10">

          <div className="w-full max-w-sm">
            <p className="text-sm mb-2">Step 2 of 4</p>
            <h2 className="text-xl text-center font-bold mb-6">Complete your profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <div className="relative w-full mb-3">
  <select
    name="specialization"
    value={formData.specialization}
    onChange={handleChange}
    className="w-full border p-2 pr-10 rounded-xl appearance-none bg-white"
  >
    <option value="">Select your specialization</option>
    <option value="General Physician">General Physician</option>
    <option value="Dermatologist">Dermatologist</option>
    <option value="Dentist">Dentist</option>
    <option value="Pediatrician">Pediatrician</option>
  </select>

  {/* Custom arrow icon */}
  <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
    ▼
  </div>
</div>

                {errors.specialization && <p className="text-red-500 text-xs">{errors.specialization}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="regNumber"
                  placeholder="Medical Registration Number"
                  value={formData.regNumber}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.regNumber && <p className="text-red-500 text-xs">{errors.regNumber}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="clinicName"
                  placeholder="Clinic/Hospital Name"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.clinicName && <p className="text-red-500 text-xs">{errors.clinicName}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="location"
                  placeholder="City/Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
              </div>

              {/* ✅ NEW FIELDS START */}
              <div className="mb-3">
                <input
                  type="text"
                  name="locality"
                  placeholder="Locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.locality && <p className="text-red-500 text-xs">{errors.locality}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl"
                />
                {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
              </div>
              {/* ✅ NEW FIELDS END */}

              <Button
                type="submit"
                className="w-full h-10 text-white text-sm rounded-full hover:bg-purple-700 transition mt-2"
              >
                Save Profile
              </Button>
            </form>

            <p className="mt-2 text-xs text-center">
              Verification Progress
              <span className="ml-2">{progress}%</span>
            </p>
            <div className="h-1 bg-gray-300 w-full mt-1 rounded">
              <div className="h-1 bg-black rounded" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="absolute w-1/2 top-0 bottom-0 right-0 bg-gray-200 flex items-center justify-center ml-6">
          <span className="text-gray-500">Image Placeholder</span>
        </div>
      </div>
    </div>
  );
};

export default StepTwoPage;
