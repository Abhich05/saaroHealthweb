import React, { useState } from "react";
import Header2 from "../components/layout/Header2";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import FileUploadField from "../components/ui/FileUploadField";


const StepThreePage = () => {
    const navigate = useNavigate();
  const [registrationCert, setRegistrationCert] = useState(null);
  const [degreeCert, setDegreeCert] = useState(null);
  const [govID, setGovID] = useState(null);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(50); // Starts at 66% (after previous steps)

 const handleFileChange = (e, field) => {
  const file = e.target.files[0];
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  // Clear previous errors
  setErrors((prev) => ({ ...prev, [field]: "" }));

  if (file) {
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Invalid file type. Only PDF, JPG, or PNG allowed.",
      }));
      return;
    }

    // Set valid file
    if (field === "registrationCert") setRegistrationCert(file);
    else if (field === "degreeCert") setDegreeCert(file);
    else if (field === "govID") setGovID(file);
  }
};


  const handleNext = () => {
    let newErrors = {};
    if (!registrationCert) newErrors.registrationCert = "Please upload certificate.";
    if (!degreeCert) newErrors.degreeCert = "Please upload certificate.";
    if (!govID) newErrors.govID = "Please upload ID.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Add +25% only if not already added
      if (progress === 50) {
        setProgress(progress + 25);
      }
      navigate('/step4')
      console.log("Proceed to next step");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header2 />
      <div className="flex flex-1">
        {/* Left form area */}
        <div className="w-1/2 px-10 py-8 flex flex-col justify-center">
          <p className="text-sm mb-2">Step 3 of 4</p>
          <h2 className="text-lg md:text-xl font-semibold mb-1 text-center">Upload Your Credentials</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">Please upload the necessary documents to verify your profile.</p>

          {/* Medical Certificate */}
                        <FileUploadField
                          label="Medical Registration Certificate"
                          file={registrationCert}
                          onChange={(e) => handleFileChange(e, "registrationCert")}
                          onRemove={() => setRegistrationCert(null)}
                          error={errors.registrationCert}
                       />

          {/* Degree Certificate */}
                        <FileUploadField
                          label="Degree Certificate"
                          file={degreeCert}
                          onChange={(e) => handleFileChange(e, "degreeCert")}
                          onRemove={() => setDegreeCert(null)}
                          error={errors.degreeCert}
                        />

          {/* Government ID */}
                        <FileUploadField
                            label="Government-issued ID"
                            file={govID}
                            onChange={(e) => handleFileChange(e, "govID")}
                            onRemove={() => setGovID(null)}
                            error={errors.govID}
                        />

          {/* Buttons */}
                          <div className="flex justify-between mt-2">
                            <button
                              className="px-5 h-9 bg-gray-200 text-[#000000] text-sm rounded-full hover:bg-gray-300 transition"
                              onClick={() => navigate('./step2')}
                            >
                              Back
                            </button>
                            <Button
                              className="px-5 h-9  text-white text-sm rounded-full hover:bg-purple-700 transition"
                              onClick={handleNext}
                            >
                              Next
                            </Button>
                          </div>

          {/* Progress Bar */}
                    <div className="mt-6">
                      <p className="text-xs mb-1">Verification Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-black h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-right mt-1">{progress}%</p>
                    </div>
                  </div>

                  {/* Right side image area */}
                  <div className="w-1/2 h-[calc(100vh-20px)] bg-[#fde7d9] flex items-center justify-center">
                    <img
                      src="/path/to/your/image.png"
                      alt="Doctor illustration"
                      className="h-full w-auto object-cover"
                    />
                  </div>
      </div>
    </div>
  );
};

export default StepThreePage;
