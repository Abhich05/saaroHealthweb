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
          console.log('RoleProtectedRoute - User permissions:', permissions);
          console.log('RoleProtectedRoute - Required permission:', requiredPermission);
          
          // Check if user has the required permission
          const hasRequiredPermission = permissions[requiredPermission] && 
            permissions[requiredPermission] !== 'none';
          
          console.log('RoleProtectedRoute - Has required permission:', hasRequiredPermission);
          
          // If no permissions are set (empty object), give basic access to dashboard
          if (Object.keys(permissions).length === 0 && requiredPermission === 'dashboard') {
            console.log('RoleProtectedRoute - No permissions set, allowing dashboard access');
            setHasPermission(true);
          } else {
            setHasPermission(hasRequiredPermission);
          }
        } catch (error) {
          console.error('Error parsing permissions:', error);
          // If there's an error parsing permissions, allow dashboard access
          if (requiredPermission === 'dashboard') {
            console.log('RoleProtectedRoute - Error parsing permissions, allowing dashboard access');
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
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