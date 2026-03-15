/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login as apiLogin } from '../utils/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
      window.localStorage.removeItem('bukain_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    window.localStorage.setItem('bukain_token', response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    window.localStorage.removeItem('bukain_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
