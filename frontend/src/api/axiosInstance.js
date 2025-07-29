import axios from 'axios';
import cookies from 'js-cookie';

// axiosInstance is configured to use the backend API base URL from .env
// Make sure VITE_API_URL is set correctly in your .env file
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // IF you plan to use cookies in some cases
  // Do not set Content-Type globally; let axios handle it per request
});

// Add JWT to requests automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if it's a user login or doctor login
    const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
    
    if (isUserLogin) {
      // Use user JWT token
      const token = cookies.get('user_jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Use doctor JWT token
      const token = cookies.get('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
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
