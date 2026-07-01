/**
 * AuthContext — Global authentication state provider for Smart FinTracker.
 * Manages user session, JWT token persistence, login/register flows,
 * and exposes auth state + actions to the entire component tree.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fintracker_token'));
  const [loading, setLoading] = useState(true);

  // On mount, verify the stored token by fetching the user profile
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getProfile();
        setUser(res.data);
      } catch (err) {
        // Token is expired or invalid — clear it
        localStorage.removeItem('fintracker_token');
        localStorage.removeItem('fintracker_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('fintracker_token', newToken);
    localStorage.setItem('fintracker_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('fintracker_token', newToken);
    localStorage.setItem('fintracker_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('fintracker_token');
    localStorage.removeItem('fintracker_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
