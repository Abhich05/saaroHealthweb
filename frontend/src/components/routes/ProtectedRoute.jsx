import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import logger from "../../utils/logger";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isUserLogin } = useAuth();

  logger.debug('ProtectedRoute:', {
    isAuthenticated,
    isUserLogin,
  });

  if (!isAuthenticated) {
    const redirectPath = isUserLogin ? "/user-login" : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
