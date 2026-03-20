import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await authService.login(identifier, password);
    setLoading(false);
    if (result.success) {
      login(result.user);
      navigate('/welcome');
    }
  };

  return (
    <div className="login-page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-content-wrapper"
      >
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Enter your details to access your account.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email or User ID</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com or User ID"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="btn-icon" />
          </button>
        </form>

        <p className="login-footer-text">
          Don't have an account?{' '}
          <span className="login-link-disabled">
            Create one
          </span>
        </p>
      </motion.div>
    </div>
  );
};
