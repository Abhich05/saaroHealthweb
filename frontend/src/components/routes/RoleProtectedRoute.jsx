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
        console.log('RoleProtectedRoute - No doctor ID found');
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
          
          // If permissions object is empty or has no meaningful permissions, 
          // only allow dashboard access
          const hasAnyPermissions = Object.keys(permissions).length > 0 && 
            Object.values(permissions).some(perm => perm !== 'none');
          
          if (!hasAnyPermissions && requiredPermission === 'dashboard') {
            console.log('RoleProtectedRoute - No meaningful permissions, allowing dashboard access');
            setHasPermission(true);
          } else if (!hasAnyPermissions) {
            console.log('RoleProtectedRoute - No meaningful permissions, denying access');
            setHasPermission(false);
          } else {
            setHasPermission(hasRequiredPermission);
          }
        } catch (error) {
          console.error('Error parsing permissions:', error);
          // If there's an error parsing permissions, only allow dashboard access
          if (requiredPermission === 'dashboard') {
            console.log('RoleProtectedRoute - Error parsing permissions, allowing dashboard access');
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
        }
      } else if (isUser && !userPermissions) {
        // User login but no permissions set - only allow dashboard
        console.log('RoleProtectedRoute - User login but no permissions set');
        setHasPermission(requiredPermission === 'dashboard');
      } else {
        // Doctor login - has full access
        console.log('RoleProtectedRoute - Doctor login, full access granted');
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