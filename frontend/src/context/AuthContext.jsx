import { createContext, useContext, useEffect, useState } from 'react';
import api, { clearToken, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from saved token
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const res = await api.post('/auth/login', credentials);
    setToken(res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Log out locally even if the server fails
    }
    clearToken();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Home page per role
export const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/chat');
