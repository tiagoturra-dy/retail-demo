import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const s = styles || {};

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
    <div className={s.loginPageContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={s.loginContentWrapper}
      >
        <div className={s.loginHeader}>
          <h1 className={s.loginTitle}>Welcome Back</h1>
          <p className={s.loginSubtitle}>Enter your details to access your account.</p>
        </div>

        <form className={s.loginForm} onSubmit={handleLogin}>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Email or User ID</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com or User ID"
              required
              className={s.formInput}
            />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={s.formInput}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={s.loginSubmitBtn}
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className={s.btnIcon} />
          </button>
        </form>

        <p className={s.loginFooterText}>
          Don't have an account?{' '}
          <span className={s.loginLinkDisabled}>
            Create one
          </span>
        </p>
      </motion.div>
    </div>
  );
};
