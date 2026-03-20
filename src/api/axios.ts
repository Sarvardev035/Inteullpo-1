import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://finly.uyqidir.uz/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auto-redirect to login when token is expired/invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we had a token (i.e. this is an auth failure, not a login attempt)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        // Use window.location to force full reload and state reset
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

