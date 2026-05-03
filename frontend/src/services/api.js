import axios from 'axios';

// In production (Render), this reads from .env.production → VITE_API_BASE_URL
// In development, it falls back to localhost:8000
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';


const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach access token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response Interceptor — auto-refresh token on 401 ─────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 and not already retrying and not the refresh/login endpoint itself
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/token/refresh')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      // No refresh token stored → clear everything and go to login
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }

      // If already refreshing, queue the failed request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      // Start refreshing
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/token/refresh`, {
          refresh: refreshToken,
        });
        const newAccess = res.data.access;
        // SimpleJWT also rotates the refresh token when ROTATE_REFRESH_TOKENS=True
        const newRefresh = res.data.refresh;

        localStorage.setItem('access_token', newAccess);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh token also expired or blacklisted → force logout
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  login:          (d) => api.post('/auth/login', d),
  logout:         (d) => api.post('/auth/logout', d),
  getProfile:     () => api.get('/auth/profile'),
  updateProfile:  (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.post('/auth/change-password', d),
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard'),
};

// ── Entries ──────────────────────────────────────────────────────────────────
export const entriesAPI = {
  // FIX: Unwrap paginated response — backend now returns {count, results:[...]}
  // instead of a raw array. We normalize it here so all components stay simple.
  getAll: async (params = {}) => {
    const res = await api.get('/entries', { params });
    // Handle both paginated ({results:[...]}) and plain array responses
    const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
    return { ...res, data };
  },
  create: (d)    => api.post('/entries', d),
  update: (id, d) => api.put(`/entries/${id}`, d),
  delete: (id)   => api.delete(`/entries/${id}`),
};

export default api;
