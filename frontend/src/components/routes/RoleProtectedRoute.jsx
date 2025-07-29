import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../ui/Loading";

const RoleProtectedRoute = ({ children, requiredPermission }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(false);

  useEffect(() => {
    const checkPermissions = () => {
      const userPermissions = localStorage.getItem('userPermissions');
      const doctorId = localStorage.getItem('doctorId');
      const isUser = localStorage.getItem('isUserLogin') === 'true';

      setIsUserLogin(isUser);

      if (!doctorId) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      if (isUser && userPermissions) {
        try {
          const permissions = JSON.parse(userPermissions);
          const hasRequiredPermission = permissions[requiredPermission] && 
            permissions[requiredPermission] !== 'none';
          setHasPermission(hasRequiredPermission);
        } catch (error) {
          console.error('Error parsing permissions:', error);
          setHasPermission(false);
        }
      } else {
        // Doctor login - has full access
        setHasPermission(true);
      }

      setIsLoading(false);
    };

    checkPermissions();
  }, [requiredPermission]);

  if (isLoading) {
    return <Loading />;
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleProtectedRoute; 