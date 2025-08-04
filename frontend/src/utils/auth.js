import cookies from 'js-cookie';

// Doctor token management
export const setDoctorToken = (token) => {
  cookies.set('jwt_token', token, { 
    expires: 7, 
    secure: false, // Allow HTTP in development
    sameSite: 'lax' // Use lax for better compatibility
  });
}

export const getDoctorToken = () => {
  return cookies.get('jwt_token');
}

export const removeDoctorToken = () => {
  cookies.remove('jwt_token');
}

// User token management
export const setUserToken = (token) => {
  cookies.set('user_jwt_token', token, { 
    expires: 7, 
    secure: false, // Allow HTTP in development
    sameSite: 'lax' // Use lax for better compatibility
  });
}

export const getUserToken = () => {
  return cookies.get('user_jwt_token');
}

export const removeUserToken = () => {
  cookies.remove('user_jwt_token');
}

// Legacy functions for backward compatibility
export const setToken = (token) => {
  setDoctorToken(token);
}

export const getToken = () => {
  return getDoctorToken();
}

export const removeToken = () => {
  removeDoctorToken();
}

// Clear all authentication data
export const clearAllAuth = () => {
  removeDoctorToken();
  removeUserToken();
  localStorage.removeItem('doctorId');
  localStorage.removeItem('userId');
  localStorage.removeItem('isUserLogin');
  localStorage.removeItem('doctorName');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('clinicName');
}