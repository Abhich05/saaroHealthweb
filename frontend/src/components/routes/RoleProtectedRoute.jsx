import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../ui/Loading";
import { useAuth } from "../../context/AuthProvider";
import logger from "../../utils/logger";

const RoleProtectedRoute = ({ children, requiredPermission }) => {
  const { ready, isUserLogin, permissions } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!ready) {
      setIsLoading(true);
      return;
    }

    const checkPermissions = () => {
      if (!isUserLogin) {
        // Doctor login - full access
        logger.debug('RoleProtectedRoute - Doctor login, full access granted');
        setHasPermission(true);
        setIsLoading(false);
        return;
      }

      try {
        logger.debug('RoleProtectedRoute - User permissions:', permissions);
        logger.debug('RoleProtectedRoute - Required permission:', requiredPermission);

        const hasRequiredPermission = Boolean(permissions?.[requiredPermission] && permissions[requiredPermission] !== 'none');

        const hasAnyPermissions = permissions && Object.keys(permissions).length > 0 &&
          Object.values(permissions).some(perm => perm !== 'none');

        if (!hasAnyPermissions && requiredPermission === 'dashboard') {
          logger.debug('RoleProtectedRoute - No meaningful permissions, allowing dashboard access');
          setHasPermission(true);
        } else if (!hasAnyPermissions) {
          logger.debug('RoleProtectedRoute - No meaningful permissions, denying access');
          setHasPermission(false);
        } else {
          setHasPermission(hasRequiredPermission);
        }
      } catch (error) {
        logger.error('RoleProtectedRoute - Error evaluating permissions:', error);
        setHasPermission(requiredPermission === 'dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [ready, isUserLogin, permissions, requiredPermission]);

  if (isLoading) {
    return <Loading />;
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleProtectedRoute;