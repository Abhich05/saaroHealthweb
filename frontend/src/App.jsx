import React, { useEffect, useState, createContext, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomToastContainer from "./components/ui/ToastContainer";
import Loading from "./components/ui/Loading";
import ErrorBoundary from "./components/common/ErrorBoundary";

import ProtectedRoute from "./components/routes/ProtectedRoute";
import RoleProtectedRoute from "./components/routes/RoleProtectedRoute";
// Route-level code splitting: lazy-load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AiAssistant = lazy(() => import("./pages/AiAssistant"));
const Invoice = lazy(() => import("./pages/Invoice"));
const CreateRx = lazy(() => import("./pages/CreateRx"));
const AllPatients = lazy(() => import("./pages/AllPatients"));
const IPDRecords = lazy(() => import("./pages/IpdRecords"));
const Settings = lazy(() => import("./pages/Settings"));
const Templates = lazy(() => import("./pages/Template"));
const DropDownConfiguration = lazy(() => import("./pages/DropDownConfiguration"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Document = lazy(() => import("./pages/Document"));
const Medicines = lazy(() => import("./pages/Medicine"));
const PatientQueue = lazy(() => import("./pages/PatientQueue"));
const ConsultationForm = lazy(() => import("./pages/Consult"));
const DischargeSummaryForm = lazy(() => import("./pages/Discharge"));
const Messages = lazy(() => import("./pages/Messages"));
const AppointmentsDashboard = lazy(() => import("./pages/Appointments"));
const PublicBookingPage = lazy(() => import("./pages/PublicBookingPage"));
const NotFoundPage = lazy(() => import("./pages/PageNotFound"));
const Socials = lazy(() => import("./pages/Socials"));
const Automation = lazy(() => import("./pages/Automation"));
const PatientHistoryPage = lazy(() => import("./pages/PatientHistoryPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const OnboardingPage = lazy(() => import("./pages/OnBoardingPage"));
const SignupStepsPage = lazy(() => import("./pages/SignupStepsPage"));
const StepTwoPage = lazy(() => import("./pages/StepTwoPage"));
const StepThreePage = lazy(() => import("./pages/StepThreePage"));
const StepFourPage = lazy(() => import("./pages/StepFourPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const UserLoginPage = lazy(() => import("./pages/UserLoginPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyAccountPage = lazy(() => import("./pages/VerifyAccountPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PhoneLogin = lazy(() => import("./pages/PhoneLogin"));
const PasswordResetSuccess = lazy(() => import("./pages/PasswordResetSuccess"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
import axiosInstance from './api/axiosInstance';
import { clearAllAuth } from "./utils/auth";

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
        
        // Optionally fetch fresh user data from server
        try {
          const res = await axiosInstance.get('/user/me');
          if (res.data && res.data.user) {
            const freshUserData = {
              id: res.data.user.id,
              name: res.data.user.name,
              role: res.data.user.role,
              permissions: res.data.user.permissions,
              doctorId: res.data.user.doctorId,
              doctorName: res.data.user.doctorName,
              clinicName: res.data.user.clinicName
            };
            setUser(freshUserData);
            setDoctorName(freshUserData.doctorName);
            
            // Update localStorage with fresh data
            localStorage.setItem('userName', freshUserData.name);
            localStorage.setItem('userRole', freshUserData.role);
            localStorage.setItem('userPermissions', JSON.stringify(freshUserData.permissions));
            localStorage.setItem('doctorName', freshUserData.doctorName);
            localStorage.setItem('clinicName', freshUserData.clinicName);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Don't redirect on error, just use localStorage data
        }
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
          clearAllAuth();
        }
      }
      
      setIsLoading(false);
    };

    loadUserData();
  }, []); // Remove doctorId dependency to prevent re-triggering on staff login

  // Listen for storage changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'doctorId' || e.key === 'userId' || e.key === 'isUserLogin') {
        // Reload user data when authentication state changes
        const loadUserData = async () => {
          setIsLoading(true);
          
          const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
          
          if (isUserLogin) {
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
            setDoctorId(userData.doctorId);
            
            // Optionally fetch fresh user data from server
            try {
              const res = await axiosInstance.get('/user/me');
              if (res.data && res.data.user) {
                const freshUserData = {
                  id: res.data.user.id,
                  name: res.data.user.name,
                  role: res.data.user.role,
                  permissions: res.data.user.permissions,
                  doctorId: res.data.user.doctorId,
                  doctorName: res.data.user.doctorName,
                  clinicName: res.data.user.clinicName
                };
                setUser(freshUserData);
                setDoctorName(freshUserData.doctorName);
                
                // Update localStorage with fresh data
                localStorage.setItem('userName', freshUserData.name);
                localStorage.setItem('userRole', freshUserData.role);
                localStorage.setItem('userPermissions', JSON.stringify(freshUserData.permissions));
                localStorage.setItem('doctorName', freshUserData.doctorName);
                localStorage.setItem('clinicName', freshUserData.clinicName);
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              // Don't redirect on error, just use localStorage data
            }
          } else {
            const newDoctorId = localStorage.getItem('doctorId');
            setDoctorId(newDoctorId);
            setUser(null);
            
            if (newDoctorId) {
              try {
                const res = await axiosInstance.get(`/doctor/${newDoctorId}`);
                const doctorName = res.data.doctor?.name || '';
                setDoctorName(doctorName);
                
                if (doctorName) {
                  localStorage.setItem('doctorName', doctorName);
                }
              } catch (error) {
                console.error('Error fetching doctor data:', error);
                setDoctorName('');
                clearAllAuth();
              }
            }
          }
          
          setIsLoading(false);
        };
        
        loadUserData();
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
          <CustomToastContainer />
          <ErrorBoundary>
          <Suspense fallback={<Loading />}>
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
            <Route path="/book-appointment/:doctorId" element={<PublicBookingPage />} />

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
            <Route path="/dropdown-configuration" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="library"><DropDownConfiguration /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="library"><Referrals /></RoleProtectedRoute></ProtectedRoute>} />
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
          </Suspense>
          </ErrorBoundary>
        </UserContext.Provider>
      </DoctorNameContext.Provider>
    </DoctorIdContext.Provider>
  );
}

export default App;
