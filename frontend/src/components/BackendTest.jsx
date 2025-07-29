import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const BackendTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    addResult('Testing backend connection...', 'info');
    
    try {
      const response = await fetch('https://saarohealthweb-1.onrender.com/api/test-auth');
      const data = await response.json();
      addResult(`Backend connection: ${response.status} - ${JSON.stringify(data)}`, 'success');
    } catch (error) {
      addResult(`Backend connection failed: ${error.message}`, 'error');
    }
    
    setLoading(false);
  };

  const testUserRoute = async () => {
    setLoading(true);
    const doctorId = localStorage.getItem('doctorId');
    addResult(`Testing user route with doctorId: ${doctorId}`, 'info');
    
    try {
      const response = await axiosInstance.get(`/${doctorId}/users`);
      addResult(`User route success: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addResult(`User route error: ${error.response?.status} - ${error.response?.data?.error || error.message}`, 'error');
    }
    
    setLoading(false);
  };

  const testAuthHeaders = () => {
    const doctorId = localStorage.getItem('doctorId');
    const isUserLogin = localStorage.getItem('isUserLogin');
    const jwtToken = document.cookie.includes('jwt_token');
    const userJwtToken = document.cookie.includes('user_jwt_token');
    
    addResult(`Auth Debug:`, 'info');
    addResult(`- Doctor ID: ${doctorId}`, 'info');
    addResult(`- Is User Login: ${isUserLogin}`, 'info');
    addResult(`- JWT Token: ${jwtToken ? 'Present' : 'Missing'}`, 'info');
    addResult(`- User JWT Token: ${userJwtToken ? 'Present' : 'Missing'}`, 'info');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '15px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '500px',
      overflowY: 'auto'
    }}>
      <h4>🔧 Backend Test</h4>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testBackendConnection} 
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px', fontSize: '11px' }}
        >
          Test Backend
        </button>
        <button 
          onClick={testUserRoute} 
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px', fontSize: '11px' }}
        >
          Test User Route
        </button>
        <button 
          onClick={testAuthHeaders} 
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px', fontSize: '11px' }}
        >
          Check Auth
        </button>
        <button 
          onClick={clearResults} 
          style={{ padding: '5px 10px', fontSize: '11px' }}
        >
          Clear
        </button>
      </div>
      
      <div style={{ 
        maxHeight: '300px', 
        overflowY: 'auto', 
        backgroundColor: 'white', 
        padding: '10px', 
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        {testResults.length === 0 ? (
          <p>No test results yet. Click a test button above.</p>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '5px', 
                padding: '3px',
                borderLeft: `3px solid ${
                  result.type === 'error' ? 'red' : 
                  result.type === 'success' ? 'green' : 'blue'
                }`
              }}
            >
              <small style={{ color: '#666' }}>{result.timestamp}</small>
              <div>{result.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BackendTest; 