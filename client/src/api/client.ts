import axios, { AxiosError } from 'axios';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('projectly_token') || localStorage.getItem('nova_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any }>) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');

      if (!isAuthRoute) {
        localStorage.removeItem('projectly_token');
        localStorage.removeItem('projectly_user');
        localStorage.removeItem('nova_token');
        localStorage.removeItem('nova_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
