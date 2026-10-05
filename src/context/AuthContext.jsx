import React, { createContext, useContext, useState } from 'react';
import { USERS } from '../helpers/users.js';
import { Helper } from '../helpers/helper.js';

const AuthContext = createContext();

// Get API base URL (backend server, not React dev server)
const getApiBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // In production, API is on same host/port (proxied or deployed together)
    return '';
  } else {
    // In development, API is on backend server port 5000
    return 'http://localhost:5000';
  }
};

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
    Helper.removeStoredValue('_dyjsession');
    
    // Clear cart from server
    const cartId = localStorage.getItem('retail_cart_id');
    if (cartId) {
      fetch(`${getApiBaseUrl()}/api/carts/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_CART_API_KEY || ''
        }
      }).catch(error => console.error('[logout] Error clearing cart:', error));
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEcomm = user?.role === 'ecomm';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isEcomm }}>
      {children}
    </AuthContext.Provider>
  );
};
