import React, { useState } from 'react';

const QuickTest = () => {
  const [result, setResult] = useState('');

  const testBackend = async () => {
    try {
      const response = await fetch('https://saarohealthweb-1.onrender.com/api/test-auth');
      const data = await response.json();
      setResult(`Status: ${response.status}, Data: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testUserRoute = async () => {
    try {
      const doctorId = localStorage.getItem('doctorId');
      const response = await fetch(`https://saarohealthweb-1.onrender.com/api/${doctorId}/users`, {
        credentials: 'include'
      });
      const data = await response.json();
      setResult(`Status: ${response.status}, Data: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
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
      <h4>Quick Test</h4>
      <button onClick={testBackend} style={{ marginRight: '5px', padding: '5px 10px' }}>
        Test Backend
      </button>
      <button onClick={testUserRoute} style={{ padding: '5px 10px' }}>
        Test Users
      </button>
      <div style={{ marginTop: '10px', fontSize: '11px' }}>
        {result}
      </div>
    </div>
  );
};

export default QuickTest; 