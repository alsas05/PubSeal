import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach admin authorization key and token
api.interceptors.request.use(
  (config) => {
    const adminKey =
      sessionStorage.getItem('pubseal_admin_key') ||
      localStorage.getItem('pubseal_admin_key') ||
      'pubseal_dev_admin_2026';

    if (adminKey) {
      config.headers['x-admin-key'] = adminKey;
    }

    const token =
      sessionStorage.getItem('pubseal_admin_token') ||
      localStorage.getItem('pubseal_admin_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Admin session unauthorized
      console.warn('[PubSeal Admin] API authorization error:', error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

// Admin Database endpoints
export const adminDatabaseApi = {
  getOverview: () => api.get('/database/overview'),
  getAnalytics: () => api.get('/database/analytics'),
  getCollection: (name, params = {}) =>
    api.get(`/database/collections/${name}`, { params }),
  exportCollection: (name, format = 'json') =>
    api.get(`/database/export/${name}`, {
      params: { format },
      responseType: 'blob',
    }),
  exportAll: () =>
    api.get('/database/export-all', {
      responseType: 'blob',
    }),
  syncCertificates: () => api.post('/database/sync-certificates'),
};

// Admin authentication endpoints
export const adminAuthApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyKey: async (key) => {
    return api.get('/database/overview', {
      headers: { 'x-admin-key': key },
    });
  },
};

export default api;

