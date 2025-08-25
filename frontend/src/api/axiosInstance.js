import axios from 'axios';
import { getDoctorToken, getUserToken } from '../utils/auth';
import logger from '../utils/logger';

// Configure base URL with environment variable or fallback
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://saarohealthweb-1.onrender.com/api';

// Create axios instance with optimized defaults
const axiosInstance = axios.create({
  baseURL,
  withCredentials: false, // Disable credentials for CORS
  timeout: 10000, // 10 second timeout to prevent long loaders
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Remove problematic headers that cause CORS issues
axiosInstance.interceptors.request.use(config => {
  // Remove headers that might cause CORS issues
  const headers = { ...config.headers };
  delete headers['Cache-Control'];
  delete headers['Pragma'];
  delete headers['Expires'];
  
  // Only add Content-Type for non-form data requests
  if (!(config.data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else {
    delete headers['Content-Type'];
  }
  
  return {
    ...config,
    headers
  };
});

// Add JWT to requests automatically (do NOT short-circuit with cached responses here)
axiosInstance.interceptors.request.use(
  (config) => addAuthHeader(config),
  (error) => Promise.reject(error)
);

// Helper function to add auth header
const addAuthHeader = (config) => {
  const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
  const token = isUserLogin ? getUserToken() : getDoctorToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};
    
// Response interceptor for success and 401 handling
axiosInstance.interceptors.response.use(
  (response) => {
    // no-op success path
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Signal auth layer to clear state and navigate
      logger.warn('axiosInstance: 401 unauthorized detected, dispatching auth:unauthorized');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
