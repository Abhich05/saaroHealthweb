import axios from 'axios';
import { getDoctorToken, getUserToken, clearAllAuth } from '../utils/auth';

// axiosInstance is configured to use the backend API base URL from .env
// Make sure VITE_API_BASE_URL is set correctly in your .env file
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://saarohealthweb-1.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Enable cookies for cross-origin requests
});

// Add JWT to requests automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Debug logging
    console.log('=== AXIOS INTERCEPTOR DEBUG ===');
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    
    // Check if it's a user login or doctor login
    const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
    console.log('Is user login:', isUserLogin);
    
    if (isUserLogin) {
      // Use user JWT token
      const token = getUserToken();
      console.log('User JWT token:', token ? 'Present' : 'Missing');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added user JWT to Authorization header');
      }
    } else {
      // Use doctor JWT token
      const token = getDoctorToken();
      console.log('Doctor JWT token:', token ? 'Present' : 'Missing');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added doctor JWT to Authorization header');
      }
    }
    
    console.log('Final headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global errors (e.g., token expiry)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('=== 401 UNAUTHORIZED ERROR ===');
      console.log('Error response:', error.response.data);
      
      // Check if this is a token authentication issue
      const errorMessage = error.response.data?.error || '';
      const isTokenError = errorMessage.includes('token') || 
                          errorMessage.includes('unauthorized') ||
                          errorMessage.includes('Access token required') ||
                          errorMessage.includes('Token expired');
      
      if (isTokenError) {
        console.log('Token authentication error detected, clearing auth data');
        
        // Clear all authentication data
        clearAllAuth();
        
        // Redirect to appropriate login page
        const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
        const redirectPath = isUserLogin ? '/user-login' : '/login';
        
        console.log('Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
