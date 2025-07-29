import cookies from 'js-cookie';

export const setToken = (token) => {
  cookies.set('jwt_token', token, { expires: 7, secure: true, sameSite: 'Strict' });
}

export const getToken = () => {
  return cookies.get('jwt_token');
}

export const removeToken = () => {
  cookies.remove('jwt_token');
}