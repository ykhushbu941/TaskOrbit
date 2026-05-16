import axios from 'axios';

import { useAuthStore } from '../store/useStore';

const API_HOST = window.location.hostname;
const baseURL = import.meta.env.PROD 
  ? '/api'
  : `http://${API_HOST}:5000/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to handle errors or add tokens if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login/signup pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        console.warn('Session expired or unauthorized. Logging out...');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
