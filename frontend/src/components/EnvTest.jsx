import React from 'react';

const EnvTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h3>Environment Variables Test</h3>
      <p><strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
      <p><strong>NODE_ENV:</strong> {import.meta.env.NODE_ENV}</p>
      <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
      <p><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
      <p><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</p>
    </div>
  );
};

export default EnvTest; 