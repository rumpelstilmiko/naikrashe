import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_KEY, USER_KEY, setUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const navigate = useNavigate();
  const toast = useToast();

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: profile } = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate('/');
  }, [clearSession, navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      toast.error('Сессия истекла');
      navigate('/login');
    });
  }, [clearSession, navigate, toast]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
