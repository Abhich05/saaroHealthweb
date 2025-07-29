import React, { useState, useEffect } from 'react';

const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState({});

  useEffect(() => {
    const updateAuthInfo = () => {
      setAuthInfo({
        doctorId: localStorage.getItem('doctorId'),
        userId: localStorage.getItem('userId'),
        isUserLogin: localStorage.getItem('isUserLogin'),
        userPermissions: localStorage.getItem('userPermissions'),
        userName: localStorage.getItem('userName'),
        doctorName: localStorage.getItem('doctorName'),
        jwtToken: document.cookie.includes('jwt_token') ? 'Present' : 'Missing',
        userJwtToken: document.cookie.includes('user_jwt_token') ? 'Present' : 'Missing',
      });
    };

    updateAuthInfo();
    // Update every 2 seconds
    const interval = setInterval(updateAuthInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearAuth = () => {
    localStorage.clear();
    document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user_jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
  };

  const testUserRoute = () => {
    window.location.href = '/user';
  };

  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      margin: '10px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔍 Authentication Debug</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
        <div><strong>Doctor ID:</strong> {authInfo.doctorId || 'Missing'}</div>
        <div><strong>User ID:</strong> {authInfo.userId || 'Missing'}</div>
        <div><strong>Is User Login:</strong> {authInfo.isUserLogin || 'Missing'}</div>
        <div><strong>User Name:</strong> {authInfo.userName || 'Missing'}</div>
        <div><strong>Doctor Name:</strong> {authInfo.doctorName || 'Missing'}</div>
        <div><strong>JWT Token:</strong> {authInfo.jwtToken}</div>
        <div><strong>User JWT Token:</strong> {authInfo.userJwtToken}</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>User Permissions:</strong>
        <pre style={{ 
          fontSize: '10px', 
          backgroundColor: '#fff', 
          padding: '5px', 
          borderRadius: '4px',
          maxHeight: '100px',
          overflow: 'auto'
        }}>
          {authInfo.userPermissions ? JSON.stringify(JSON.parse(authInfo.userPermissions), null, 2) : 'None'}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={testUserRoute}
          style={{ 
            padding: '5px 10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test /user Route
        </button>
        <button 
          onClick={clearAuth}
          style={{ 
            padding: '5px 10px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Auth
        </button>
      </div>
    </div>
  );
};

export default AuthDebug; 