import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://finly.uyqidir.uz';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: add JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: Unauthorized — redirect to login
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Network or CORS errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('🔴 CORS/Network error on:', error.config?.url);
      console.warn('Backend must enable CORS. Check Java Spring config.');
    }

    return Promise.reject(error);
  }
);

export default api;
