import axios from 'axios';

const API = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega el token a cada petición SI existe y NO es login
API.interceptors.request.use((config) => {
  // No enviar token en la petición de login (causa error 400 si hay token viejo)
  if (config.url?.includes('/auth/login')) return config;

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  if (userData.accessToken) {
    config.headers.Authorization = `Bearer ${userData.accessToken}`;
  }
  return config;
});

export default API;
