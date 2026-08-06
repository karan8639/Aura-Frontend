import axios from 'axios';

const API_BASE_URL = 'https://aura-backend-production-2834.up.railway.app';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Using window.location.href to avoid dependency on a specific router implementation inside the lib
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
