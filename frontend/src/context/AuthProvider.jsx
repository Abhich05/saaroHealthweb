import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDoctorToken, getUserToken, clearAllAuth } from '../utils/auth';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [ready, setReady] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(localStorage.getItem('isUserLogin') === 'true');
  const [doctorId, setDoctorId] = useState(localStorage.getItem('doctorId') || null);
  const [user, setUser] = useState(() => {
    if (localStorage.getItem('isUserLogin') === 'true') {
      return {
        id: localStorage.getItem('userId') || null,
        name: localStorage.getItem('userName') || null,
        role: localStorage.getItem('userRole') || null,
        permissions: JSON.parse(localStorage.getItem('userPermissions') || '{}'),
        doctorId: localStorage.getItem('doctorId') || null,
      };
    }
    return null;
  });

  const isAuthenticated = useMemo(() => {
    const token = isUserLogin ? getUserToken() : getDoctorToken();
    return Boolean(token && ((isUserLogin && user?.id) || (!isUserLogin && doctorId)));
  }, [isUserLogin, user, doctorId]);

  // Respond to cross-app unauthorized events (from axios)
  useEffect(() => {
    const handler = () => {
      logger.info('AuthProvider: unauthorized event received, clearing auth');
      const wasUser = localStorage.getItem('isUserLogin') === 'true';
      clearAllAuth();
      setIsUserLogin(false);
      setDoctorId(null);
      setUser(null);
      navigate(wasUser ? '/user-login' : '/login', { replace: true, state: { from: location } });
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate, location]);

  // Sync with storage changes (e.g., login/logout in another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (['doctorId', 'userId', 'isUserLogin', 'userPermissions'].includes(e.key)) {
        setIsUserLogin(localStorage.getItem('isUserLogin') === 'true');
        setDoctorId(localStorage.getItem('doctorId'));
        if (localStorage.getItem('isUserLogin') === 'true') {
          setUser({
            id: localStorage.getItem('userId'),
            name: localStorage.getItem('userName'),
            role: localStorage.getItem('userRole'),
            permissions: JSON.parse(localStorage.getItem('userPermissions') || '{}'),
            doctorId: localStorage.getItem('doctorId'),
          });
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  const value = useMemo(() => ({
    ready,
    isAuthenticated,
    isUserLogin,
    doctorId,
    user,
    permissions: user?.permissions || {},
    logout: () => {
      const wasUser = isUserLogin;
      clearAllAuth();
      setIsUserLogin(false);
      setDoctorId(null);
      setUser(null);
      navigate(wasUser ? '/user-login' : '/login', { replace: true });
    },
  }), [ready, isAuthenticated, isUserLogin, doctorId, user, navigate]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
