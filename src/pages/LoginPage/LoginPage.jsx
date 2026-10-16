import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Gift, Heart, Truck, Icon } from 'lucide-react';
import { coatHanger } from '@lucide/lab';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';
import { LoginErrorModal } from '../../components/LoginErrorModal/LoginErrorModal';
import { getAllowedLoginDomains, isAllowedLoginEmail, sendLoginEvent } from '../../services/loginIdentityService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();

  const s = styles || {};

  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedIdentifier = identifier.trim();
    const isEmailLogin = normalizedIdentifier.includes('@');

    if (isEmailLogin && !isAllowedLoginEmail(normalizedIdentifier)) {
      const domains = getAllowedLoginDomains();
      const domainMessage = domains.length ? ` Use: ${domains.join(', ')}.` : '';
      setErrorMessage(`Enter an email address from an allowed domain.${domainMessage}`);
      setIsErrorModalOpen(true);
      return;
    }

    setLoading(true);
    const userData = login(normalizedIdentifier);

    if (userData) {
      if (userData.role === 'admin') {
        setLoading(false);
        navigate('/admin');
      } else {
        await sendLoginEvent({
          email: isEmailLogin ? normalizedIdentifier : '',
          userId: isEmailLogin ? '' : userData.user_id,
        });
        setLoading(false);
        const from = location.state?.from || '/welcome';
        navigate(from);
      }
    } else {
      setLoading(false);
      setErrorMessage('User not found. Please use a User ID.');
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className={s.loginPageContainer}>
      <div className={s.loginGrid}>
        {/* ── Sign In card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.loginCard}
        >
          <h1 className={s.loginTitle}>Sign In</h1>
          <p className={s.loginSubtitle}>Login and enjoy member-only benefits.</p>

          <form className={s.loginForm} onSubmit={handleLogin}>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or user ID"
              required
              className={s.formInput}
            />

            <div className={s.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={s.formInput}
              />
              <button
                type="button"
                className={s.passwordToggle}
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <button type="button" className={s.forgotPassword}>Forgot Password?</button>

            <button type="submit" disabled={loading} className={s.loginSubmitBtn}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </motion.div>

        {/* ── I'm New Here card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={s.newHereCard}
        >
          <h2 className={s.newHereTitle}>I'm New Here</h2>
          <p className={s.newHereSubtitle}>Create An Account To:</p>
          <ul className={s.newHereBenefits}>
            <li><Gift /> GET 10% OFF FIRST ORDER</li>
            <li><Heart /> SAVE TO WISHLIST</li>
            <li><Truck /> EASILY TRACK ORDERS</li>
            <li><Icon iconNode={coatHanger} /> CHECK OUT FASTER</li>
          </ul>
          <button className={s.createAccountBtn}>CREATE ACCOUNT</button>
        </motion.div>
      </div>

      <LoginErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

