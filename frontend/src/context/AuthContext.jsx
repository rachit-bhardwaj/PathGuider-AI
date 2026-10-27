import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('ssk_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('ssk_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Keep this tab in step with the real account: another tab may have logged in/out as a
  // different user (the token is shared), or an admin may have changed this user's role.
  useEffect(() => {
    const resync = async () => {
      const token = localStorage.getItem('ssk_token');
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const fresh = await fetchCurrentUser();
        setUser((prev) => (prev && prev.id === fresh.id && prev.role === fresh.role ? prev : fresh));
      } catch {
        /* ignore: a real expiry is handled by the next normal request */
      }
    };
    const onStorage = (e) => {
      if (e.key === 'ssk_token' || e.key === null) resync();
    };
    const onVisible = () => {
      if (!document.hidden) resync();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    localStorage.setItem('ssk_token', result.token);
    setUser(result.user);
    return result.user;
  };

  const register = async (payload) => {
    const result = await registerUser(payload);
    localStorage.setItem('ssk_token', result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem('ssk_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
