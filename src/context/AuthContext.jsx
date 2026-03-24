import React, { createContext, useContext, useState } from 'react';
import { USERS } from '../helpers/users.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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
      return userData;
    }

    // Check if ecomm user
    const ecommUser = USERS.ecomm.find(u => u.user_id === id);
    if (ecommUser) {
      const userData = { ...ecommUser, role: 'ecomm' };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      return userData;
    }

    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  const isAdmin = user?.role === 'admin';
  const isEcomm = user?.role === 'ecomm';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isEcomm }}>
      {children}
    </AuthContext.Provider>
  );
};
