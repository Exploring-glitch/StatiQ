import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../lib/api';
import { mergeSavedOnAuth } from '../lib/saved';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('statiq_token')) {
      setLoading(false);
      return;
    }
    api.me()
      .then((u) => {
        setUser(u);
        mergeSavedOnAuth().catch(() => {});
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
      const p = window.location.pathname;
      // Don't wipe guest auth forms — a stale token firing mid-signup/login
      // should stay put so the user doesn't lose what they typed.
      if (!p.startsWith('/login') && !p.startsWith('/signup')) window.location.href = '/login';
    };
    window.addEventListener('statiq:unauthorized', onUnauthorized);
    return () => window.removeEventListener('statiq:unauthorized', onUnauthorized);
  }, [logout]);

  const login = useCallback(async (payload) => {
    const data = await api.login(payload);
    setToken(data.token);
    setUser(data.user);
    mergeSavedOnAuth().catch(() => {});
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    setToken(data.token);
    setUser(data.user);
    mergeSavedOnAuth().catch(() => {});
    return data.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await api.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const refresh = useCallback(async () => {
    const me = await api.me();
    setUser(me);
    mergeSavedOnAuth().catch(() => {});
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
