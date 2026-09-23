import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hostel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('hostel_token');
      localStorage.removeItem('hostel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
