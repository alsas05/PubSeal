import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pubseal_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pubseal_token'));
  const [loading, setLoading] = useState(true);

  // Synchronize authentication on app mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('pubseal_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('pubseal_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token is invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();

    // Listen for global auth expired events triggered by api interceptor
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('pubseal:auth-expired', handleExpired);

    return () => window.removeEventListener('pubseal:auth-expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pubseal_token', res.data.token);
      localStorage.setItem('pubseal_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const socialLogin = async (providerData) => {
    const res = await authApi.socialLogin(providerData);
    if (res.data.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pubseal_token', res.data.token);
      localStorage.setItem('pubseal_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Social login failed');
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pubseal_token', res.data.token);
      localStorage.setItem('pubseal_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const verifyEmail = async (verificationData) => {
    const res = await authApi.verifyEmail(verificationData);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('pubseal_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Verification failed');
  };

  const resendVerification = async (data) => {
    const res = await authApi.resendVerification(data);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pubseal_token');
    localStorage.removeItem('pubseal_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pubseal_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isEmailVerified: !!user?.isEmailVerified,
        loading,
        login,
        socialLogin,
        register,
        verifyEmail,
        resendVerification,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

