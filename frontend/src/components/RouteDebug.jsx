import React, { useEffect, useState } from 'react';

const RouteDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      doctorId: localStorage.getItem('doctorId'),
      userId: localStorage.getItem('userId'),
      isUserLogin: localStorage.getItem('isUserLogin'),
      userPermissions: localStorage.getItem('userPermissions'),
      currentPath: window.location.pathname,
      hasDoctorId: !!localStorage.getItem('doctorId'),
      isUser: localStorage.getItem('isUserLogin') === 'true',
    };
    setDebugInfo(info);
  }, []);

  const testUserRoute = () => {
    console.log('Testing user route...');
    console.log('Debug info:', debugInfo);
    window.location.href = '/user';
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Route Debug</h4>
      <div>
        <strong>Doctor ID:</strong> {debugInfo.doctorId || 'Missing'}<br/>
        <strong>User ID:</strong> {debugInfo.userId || 'Missing'}<br/>
        <strong>Is User Login:</strong> {debugInfo.isUserLogin || 'Missing'}<br/>
        <strong>Has Doctor ID:</strong> {debugInfo.hasDoctorId ? 'Yes' : 'No'}<br/>
        <strong>Is User:</strong> {debugInfo.isUser ? 'Yes' : 'No'}<br/>
        <strong>Current Path:</strong> {debugInfo.currentPath}<br/>
      </div>
      <button 
        onClick={testUserRoute}
        style={{ 
          marginTop: '10px',
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
    </div>
  );
};

export default RouteDebug; 