import { Navigate } from "react-router-dom";
import { getDoctorToken, getUserToken } from '../../utils/auth';

const ProtectedRoute = ({ children }) => {
  const doctorId = localStorage.getItem("doctorId");
  const userId = localStorage.getItem("userId");
  const isUserLogin = localStorage.getItem("isUserLogin") === "true";
  
  // Check if user is authenticated (either as doctor or user)
  const isAuthenticated = (doctorId && !isUserLogin) || (userId && isUserLogin);
  
  // Additional token validation
  let hasValidToken = false;
  if (isUserLogin) {
    hasValidToken = !!getUserToken();
  } else {
    hasValidToken = !!getDoctorToken();
  }
  
  console.log('ProtectedRoute:', { 
    doctorId: doctorId ? 'Present' : 'Missing', 
    userId: userId ? 'Present' : 'Missing', 
    isUserLogin, 
    isAuthenticated,
    hasValidToken,
    userPermissions: localStorage.getItem('userPermissions')
  });

  if (!isAuthenticated || !hasValidToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
