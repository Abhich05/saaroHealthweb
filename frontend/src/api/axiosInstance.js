import axios from 'axios';
import cookies from 'js-cookie';

// axiosInstance is configured to use the backend API base URL from .env
// Make sure VITE_API_BASE_URL is set correctly in your .env file
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://saarohealthweb-1.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // IF you plan to use cookies in some cases
  // Do not set Content-Type globally; let axios handle it per request
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
      const token = cookies.get('user_jwt_token');
      console.log('User JWT token:', token ? 'Present' : 'Missing');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added user JWT to Authorization header');
      }
    } else {
      // Use doctor JWT token
      const token = cookies.get('jwt_token');
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
      // Clear tokens on unauthorized access
      cookies.remove('jwt_token');
      cookies.remove('user_jwt_token');
      localStorage.clear();
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
