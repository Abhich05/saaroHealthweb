import React, { useEffect, useState, createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from "./components/routes/ProtectedRoute"
import RoleProtectedRoute from "./components/routes/RoleProtectedRoute"
import Dashboard from "./pages/Dashboard"
import AiAssistant from "./pages/AiAssistant"
import Invoice from "./pages/Invoice"
import CreateRx from "./pages/CreateRx"
import AllPatients from "./pages/AllPatients"
import IPDRecords from "./pages/IpdRecords"
import Settings from "./pages/Settings"
import Templates from "./pages/Template"
import DropDownConfiguration from "./pages/DropDownConfiguration"
import Document from "./pages/Document"
import Medicines from "./pages/Medicine"
import PatientQueue from "./pages/PatientQueue" 
import ConsultationForm from "./pages/Consult"
import DischargeSummaryForm from "./pages/Discharge"
import Messages from "./pages/Messages"
import AppointmentsDashboard from "./pages/Appointments"
import NotFoundPage from "./pages/PageNotFound"
import Socials from "./pages/Socials";
import Automation from "./pages/Automation"
import PatientHistoryPage from "./pages/PatientHistoryPage";
import UserManagementPage from "./pages/UserManagementPage"
import OnboardingPage from "./pages/OnBoardingPage"
import SignupStepsPage from "./pages/SignupStepsPage";
import StepTwoPage from "./pages/StepTwoPage"
import StepThreePage from "./pages/StepThreePage"
import StepFourPage from "./pages/StepFourPage"
import LoginPage from "./pages/LoginPage"
import UserLoginPage from "./pages/UserLoginPage"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyAccountPage from "./pages/VerifyAccountPage"
import ResetPassword from "./pages/ResetPassword"
import PhoneLogin from "./pages/PhoneLogin"
import PasswordResetSuccess from "./pages/PasswordResetSuccess";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import axiosInstance from './api/axiosInstance';

export const DoctorIdContext = createContext(null);
export const DoctorNameContext = createContext(null);
export const UserContext = createContext(null);

function App() {
  const [doctorName, setDoctorName] = useState('');
  const [doctorId, setDoctorId] = useState(localStorage.getItem('doctorId'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      
      // Check if it's a user login or doctor login
      const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
      
      if (isUserLogin) {
        // Set user context for user login
        const userData = {
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('userName'),
          role: localStorage.getItem('userRole'),
          permissions: JSON.parse(localStorage.getItem('userPermissions') || '{}'),
          doctorId: localStorage.getItem('doctorId'),
          doctorName: localStorage.getItem('doctorName'),
          clinicName: localStorage.getItem('clinicName')
        };
        setUser(userData);
        setDoctorName(userData.doctorName);
      } else if (doctorId) {
        // Set doctor context for doctor login
        try {
          const res = await axiosInstance.get(`/doctor/${doctorId}`);
          const doctorName = res.data.doctor?.name || '';
          setDoctorName(doctorName);
          
          // Update localStorage with the correct doctor name
          if (doctorName) {
            localStorage.setItem('doctorName', doctorName);
          }
        } catch (error) {
          console.error('Error fetching doctor data:', error);
          setDoctorName('');
          // Clear invalid doctor data
          localStorage.removeItem('doctorId');
          localStorage.removeItem('doctorName');
          localStorage.removeItem('jwt_token');
        }
      }
      
      setIsLoading(false);
    };

    loadUserData();
  }, [doctorId]);

  // Listen for storage changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'doctorId') {
        setDoctorId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DoctorIdContext.Provider value={doctorId}>
      <DoctorNameContext.Provider value={doctorName}>
        <UserContext.Provider value={user}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user-login" element={<UserLoginPage />} />
            <Route path="/signup" element={<SignupStepsPage />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/resetsuccess" element={<PasswordResetSuccess />} />
            <Route path="/verify" element={<VerifyAccountPage />} />
            <Route path="/phonelogin" element={<PhoneLogin />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/step2" element={<StepTwoPage />} />
            <Route path="/step3" element={<StepThreePage />} />
            <Route path="/step4" element={<StepFourPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes with role-based access */}
            <Route path="/" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="dashboard"><Dashboard /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="automation"><AiAssistant /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="invoice"><Invoice /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/create-rx" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="createRx"><CreateRx /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/all-patients" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="allPatients"><AllPatients /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/ipd" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="ipd"><IPDRecords /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="settings"><Settings /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/template-library" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="library"><Templates /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/document-library" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="library"><Document /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/medicine-library" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="library"><Medicines /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/patient-queue" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="patientQueue"><PatientQueue /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path={`/:id/consult`} element={<ProtectedRoute><RoleProtectedRoute requiredPermission="createRx"><ConsultationForm /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/view-history/:uid" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="allPatients"><PatientHistoryPage /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/ipd/discharge" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="ipd"><DischargeSummaryForm /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path='/messages' element={<ProtectedRoute><RoleProtectedRoute requiredPermission="messages"><Messages /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="social"><Socials /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="automation"><Automation /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path='/appointments' element={<ProtectedRoute><RoleProtectedRoute requiredPermission="appointments"><AppointmentsDashboard /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path='/user' element={<ProtectedRoute><RoleProtectedRoute requiredPermission="settings"><UserManagementPage /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </UserContext.Provider>
      </DoctorNameContext.Provider>
    </DoctorIdContext.Provider>
  );
}

export default App;
