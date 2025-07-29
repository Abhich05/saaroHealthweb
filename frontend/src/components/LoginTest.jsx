import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const LoginTest = () => {
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

  const testDoctorLogin = async () => {
    setLoading(true);
    addResult('Testing doctor login endpoint...', 'info');
    
    try {
      const response = await axiosInstance.post('/doctor/access-token', {
        email: 'test@example.com',
        password: 'testpassword'
      });
      addResult(`Doctor login response: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addResult(`Doctor login error: ${error.response?.status} - ${error.response?.data?.error || error.message}`, 'error');
    }
    
    setLoading(false);
  };

  const testUserLogin = async () => {
    setLoading(true);
    addResult('Testing user login endpoint...', 'info');
    
    try {
      const response = await axiosInstance.post('/user/login', {
        email: 'test@example.com',
        password: 'testpassword'
      });
      addResult(`User login response: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addResult(`User login error: ${error.response?.status} - ${error.response?.data?.error || error.message}`, 'error');
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '10px', borderRadius: '8px' }}>
      <h3>Login Debug Test</h3>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testBackendConnection} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Backend Connection
        </button>
        <button 
          onClick={testDoctorLogin} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Doctor Login
        </button>
        <button 
          onClick={testUserLogin} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test User Login
        </button>
        <button 
          onClick={clearResults} 
          style={{ padding: '8px 16px' }}
        >
          Clear Results
        </button>
      </div>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
        {testResults.length === 0 ? (
          <p>No test results yet. Click a test button above.</p>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '5px', 
                padding: '5px',
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

export default LoginTest; 