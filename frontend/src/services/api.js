import axios from 'axios';

const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: inject JWT Bearer token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pubseal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 unauthenticated and 405/404 missing backend responses gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-clear if this was a login attempt failure
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('pubseal_token');
        localStorage.removeItem('pubseal_user');
        window.dispatchEvent(new Event('pubseal:auth-expired'));
      }
    } else if (error.response && (error.response.status === 405 || error.response.status === 404)) {
      // When Vercel serves index.html for API routes because no backend is mapped
      if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html')) {
        error.message =
          'Backend API is not connected yet. Please configure the VITE_API_URL environment variable in your Vercel project settings pointing to your live backend server.';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  socialLogin: (data) => api.post('/auth/social-login', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  getDevLatestEmail: () => api.get('/auth/dev-latest-email'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.patch('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Works endpoints
export const worksApi = {
  create: (formData, onProgress) =>
    api.post('/works', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
  getAll: (params = {}) => api.get('/works', { params }),
  getStats: () => api.get('/works/stats'),
  getById: (id) => api.get(`/works/${id}`),
  createVersion: (workId, formData, onProgress) =>
    api.post(`/works/${workId}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
  downloadOriginal: (id, version) =>
    api.get(`/works/${id}/file`, {
      params: version ? { version } : {},
      responseType: 'blob',
    }),
  delete: (id) => api.delete(`/works/${id}`),

  // AI Copyright Readiness & Statutory Filing Dossier
  getReadiness: (id, force = false) =>
    api.get(`/works/${id}/readiness`, { params: force ? { force: true } : {} }),
  evaluateReadiness: (id, data) =>
    api.post(`/works/${id}/readiness`, data),
  getFilingDossier: (id) =>
    api.get(`/works/${id}/readiness/dossier`),
  downloadFilingDossier: (id) =>
    api.get(`/works/${id}/readiness/dossier`, {
      params: { format: 'txt' },
      responseType: 'blob',
    }),
};

// Certificate endpoints
export const certificateApi = {
  getData: (id, version) =>
    api.get(`/works/${id}/certificate`, {
      params: version ? { version } : {},
    }),
  downloadPdf: (id, version) =>
    api.get(`/works/${id}/certificate/download`, {
      params: version ? { version } : {},
      responseType: 'blob',
    }),
};

// Verification endpoints
export const verificationApi = {
  checkFile: (formData) =>
    api.post('/verification/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  lookup: (query) => api.get('/verification/lookup', { params: { query } }),
};

export default api;

