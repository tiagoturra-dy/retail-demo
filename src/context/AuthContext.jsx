import React, { createContext, useContext, useState } from 'react';
import { USERS } from '../helpers/users.js';
import { useSession } from './SessionContext';

const AuthContext = createContext();

const storeLoginIdentity = ({ email = '', userId = '' }) => {
  if (email) localStorage.setItem('retail_login_email', email);
  else localStorage.removeItem('retail_login_email');

  if (userId) localStorage.setItem('retail_login_user_id', userId);
  else localStorage.removeItem('retail_login_user_id');
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { clearSessionData } = useSession();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (id) => {
    // Check if admin
    if (USERS.admin.includes(id)) {
      const userData = { id, role: 'admin', name: 'Admin User' };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      storeLoginIdentity({ userId: id });
      return userData;
    }

    // Check if ecomm user
    const ecommUser = USERS.ecomm.find(u => u.user_id === id);
    if (ecommUser) {
      const userData = { ...ecommUser, role: 'ecomm' };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      storeLoginIdentity({ userId: userData.user_id });
      return userData;
    }

    if (id.includes('@')) {
      const userData = {
        user_id: '',
        email: id,
        Name: id,
        DisplayName: id.split('@')[0],
        role: 'ecomm',
      };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      storeLoginIdentity({ email: id });
      return userData;
    }

    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    clearSessionData();
  };

  const isAdmin = user?.role === 'admin';
  const isEcomm = user?.role === 'ecomm';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isEcomm }}>
      {children}
    </AuthContext.Provider>
  );
};
