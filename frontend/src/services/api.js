import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptors ────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.post('/auth/change-password', d),
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard'),
};

// ── Entries ──────────────────────────────────────────────────────────────────
export const entriesAPI = {
  getAll: (params = {}) => api.get('/entries', { params }),
  create: (d) => api.post('/entries', d),
  update: (id, d) => api.put(`/entries/${id}`, d),
  delete: (id) => api.delete(`/entries/${id}`),
};

export default api;
