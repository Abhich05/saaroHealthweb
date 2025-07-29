import { Navigate } from "react-router-dom";
import cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const doctorId = localStorage.getItem("doctorId");
  const userId = localStorage.getItem("userId");
  const isUserLogin = localStorage.getItem("isUserLogin") === "true";
  
  // Check if user is authenticated (either as doctor or user)
  const isAuthenticated = (doctorId && !isUserLogin) || (userId && isUserLogin);
  
  console.log('ProtectedRoute:', { 
    doctorId: doctorId ? 'Present' : 'Missing', 
    userId: userId ? 'Present' : 'Missing', 
    isUserLogin, 
    isAuthenticated 
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
