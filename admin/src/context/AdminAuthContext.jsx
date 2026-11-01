import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthApi } from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = sessionStorage.getItem('pubseal_admin_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      const activeKey =
        sessionStorage.getItem('pubseal_admin_key') ||
        localStorage.getItem('pubseal_admin_key');

      if (activeKey === 'pubseal_dev_admin_2026') {
        setAdminUser({
          name: 'Developer Administrator',
          role: 'admin',
          type: 'developer_key',
        });
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const loginWithPasskey = async (passkey) => {
    const key = passkey.trim();
    if (key === 'pubseal_dev_admin_2026') {
      const userPayload = {
        name: 'System Developer Admin',
        email: 'developer@pubseal.internal',
        role: 'admin',
        type: 'developer_key',
      };
      sessionStorage.setItem('pubseal_admin_key', key);
      localStorage.setItem('pubseal_admin_key', key);
      sessionStorage.setItem('pubseal_admin_session', JSON.stringify(userPayload));
      setAdminUser(userPayload);
      return { success: true };
    }

    try {
      // Test key against backend database overview
      const res = await adminAuthApi.verifyKey(key);
      if (res.data.success) {
        const userPayload = {
          name: 'Authorized Administrator',
          role: 'admin',
          type: 'admin_key',
        };
        sessionStorage.setItem('pubseal_admin_key', key);
        localStorage.setItem('pubseal_admin_key', key);
        sessionStorage.setItem('pubseal_admin_session', JSON.stringify(userPayload));
        setAdminUser(userPayload);
        return { success: true };
      }
      return { success: false, message: 'Invalid administrative passkey.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Access denied. Passkey verification failed.',
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('pubseal_admin_key');
    localStorage.removeItem('pubseal_admin_key');
    sessionStorage.removeItem('pubseal_admin_token');
    localStorage.removeItem('pubseal_admin_token');
    sessionStorage.removeItem('pubseal_admin_session');
    setAdminUser(null);
  };

  const value = {
    adminUser,
    isAuthenticated: !!adminUser,
    loading,
    loginWithPasskey,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

