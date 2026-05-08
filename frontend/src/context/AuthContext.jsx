import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Start as "loading" so we validate the token before rendering any route
  const [loading, setLoading] = useState(true);

  // ── On mount: validate the stored token with the backend ────────────────────
  // This ensures that even if tokens are stored in localStorage, we confirm
  // the backend still accepts them (e.g., after a DB reset or token expiry).
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        // No credentials at all — clear anything stale and proceed as guest
        localStorage.clear();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Hit the backend profile endpoint to confirm the token is valid
        const { data } = await authAPI.getProfile();
        // Token is valid — update user with fresh data from server
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } catch {
        // Token rejected by backend (expired, blacklisted, DB reset, etc.)
        // Clear all stale auth data and force them to log in again
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (creds) => {
    const { data } = await authAPI.login(creds);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authAPI.logout({ refresh: refreshToken });
      } catch (_) {
        // Even if the server call fails, we still clear local state
      }
    }
    localStorage.clear();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (_) {
      // If the backend rejects the token (e.g., user deleted or DB reset), force logout
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
