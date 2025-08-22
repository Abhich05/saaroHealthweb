import axios from 'axios';
import { getDoctorToken, getUserToken, clearAllAuth } from '../utils/auth';

// Configure base URL with environment variable or fallback
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://saarohealthweb-1.onrender.com/api';

// Create axios instance with optimized defaults
const axiosInstance = axios.create({
  baseURL,
  withCredentials: false, // Disable credentials for CORS
  timeout: 15000, // 15 second timeout
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

// (Optional) Response cache map (write-only below). Not read at request time to avoid interceptor misuse.
const requestCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

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
    
// Response interceptor for caching successful responses
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}:${JSON.stringify(response.config.params)}`;
      requestCache.set(cacheKey, { response, timestamp: Date.now() });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      const errorMessage = error.response.data?.error?.toLowerCase() || '';
      const isTokenError = ['token', 'unauthorized', 'access token required', 'token expired']
        .some(term => errorMessage.includes(term));
      
      if (isTokenError) {
        clearAllAuth();
        const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
        window.location.href = isUserLogin ? '/user-login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add retry mechanism for failed requests
const MAX_RETRIES = 2;
const retryRequest = (error) => {
  const config = error.config;
  
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  
  config.retryCount = config.retryCount || 0;
  
  if (config.retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }
  
  config.retryCount += 1;
  
  // Exponential backoff
  const backoff = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, config.retryCount * 1000);
  });
  
  return backoff.then(() => axiosInstance(config));
};

// Add retry interceptor
axiosInstance.interceptors.response.use(null, retryRequest);

export default axiosInstance;
