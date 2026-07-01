/**
 * Centralized API service layer for Smart FinTracker.
 * Handles Axios instance configuration, JWT token management,
 * and all HTTP requests to the backend and ML service.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8000';

// Create Axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintracker_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (auto-logout on expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fintracker_token');
      localStorage.removeItem('fintracker_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/login')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ─────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// ─── Transaction Endpoints ──────────────────────────────
export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// ─── Health Check Endpoints ─────────────────────────────
export const healthAPI = {
  backend: () => api.get('/health'),
  ml: () => axios.get(`${ML_URL}/health`, { timeout: 3000 }),
};

export default api;
