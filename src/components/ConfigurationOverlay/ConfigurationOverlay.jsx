import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './ConfigurationOverlay.module.css';
import { Helper } from '../../helpers/helper';

const DEFAULT_SEARCH_TERMS = ['summer dresses', 'running shoes', 'wireless earbuds', 'winter coat', 'coffee maker'];

export const ConfigurationOverlay = ({ isOpen, onClose }) => {
  const [searchTerms, setSearchTerms] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    if (isOpen) {
      // Load existing search terms from localStorage
      const saved = localStorage.getItem('recentSearches');
      const terms = saved ? JSON.parse(saved) : DEFAULT_SEARCH_TERMS;
      setSearchTerms(terms.join('\n'));
      setMessage('');
    }
  }, [isOpen]);

  const showMessage = (msg, type = 'success', duration = 3000) => {
    setMessage(msg);
    setMessageType(type);
    if (duration) {
      setTimeout(() => setMessage(''), duration);
    }
  };

  const handleWebPushOptIn = async () => {
    setIsLoading(true);
    try {
      const dyid = Helper.getStoredValue('_dyid');
      
      // Get FCM token from localStorage (set by notificationService)
      const token = localStorage.getItem('fcm_token');
      if (!token) {
        showMessage('No notification token available. Please enable notifications first.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/webpush/opt-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dyid: dyid || '', token }),
      });

      if (response.ok) {
        showMessage('Successfully opted in to web push notifications');
      } else {
        showMessage('Failed to opt in to web push', 'error');
      }
    } catch (error) {
      console.error('WebPush opt-in error:', error);
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebPushOptOut = async () => {
    setIsLoading(true);
    try {
      const dyid = Helper.getStoredValue('_dyid');
      
      // Get FCM token from localStorage
      const token = localStorage.getItem('fcm_token');
      if (!token) {
        showMessage('No notification token available.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/webpush/opt-out', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dyid: dyid || '', token }),
      });

      if (response.ok) {
        showMessage('Successfully opted out of web push notifications');
      } else {
        showMessage('Failed to opt out of web push', 'error');
      }
    } catch (error) {
      console.error('WebPush opt-out error:', error);
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCookiesAndSession = () => {
    try {
      // Clear specific cookies and session storage
      Helper.removeStoredValue('_dyid');
      Helper.removeStoredValue('_dyjsession');
      Helper.removeStoredValue('_dyMuseChatId');

      // Also clear from sessionStorage if present
      sessionStorage.removeItem('_dyid');
      sessionStorage.removeItem('_dyjsession');
      sessionStorage.removeItem('_dyMuseChatId');

      showMessage('Cookies and session cleared. Reloading page...');
      
      // Reload after a short delay to show message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing cookies:', error);
      showMessage('Error clearing cookies', 'error');
    }
  };

  const handleClearRecentSearches = () => {
    try {
      localStorage.removeItem('recentSearches');
      setSearchTerms('');
      showMessage('Recent searches cleared');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      showMessage('Error clearing searches', 'error');
    }
  };

  const handleSaveSearchTerms = () => {
    try {
      const terms = searchTerms
        .split('\n')
        .map(term => term.trim())
        .filter(term => term.length > 0)
        .slice(0, 10); // Limit to 10 terms

      if (terms.length === 0) {
        showMessage('Please enter at least one search term', 'error');
        return;
      }

      localStorage.setItem('recentSearches', JSON.stringify(terms));
      showMessage(`Saved ${terms.length} search term${terms.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error saving search terms:', error);
      showMessage('Error saving search terms', 'error');
    }
  };

  const handleResetPushPermission = () => {
    try {
      if (typeof window.__resetPushPermission === 'function') {
        window.__resetPushPermission();
        showMessage('Push permissions reset. Reload the page to re-prompt.');
      } else {
        showMessage('Reset function not available', 'error');
      }
    } catch (error) {
      console.error('Error resetting push permission:', error);
      showMessage('Error resetting permissions', 'error');
    }
  };

  const handleResetSearchTermsToDefault = () => {
    setSearchTerms(DEFAULT_SEARCH_TERMS.join('\n'));
  };

  const handleEmailOptIn = async () => {
    if (!email || !email.includes('@')) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const dyid = Helper.getStoredValue('_dyid');
      const response = await fetch('/api/email/opt-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, dyid: dyid || '' }),
      });

      if (response.ok) {
        showMessage('Successfully opted in to email communications');
        setEmail('');
      } else {
        showMessage('Failed to opt in to email', 'error');
      }
    } catch (error) {
      console.error('Email opt-in error:', error);
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailOptOut = async () => {
    if (!email || !email.includes('@')) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const dyid = Helper.getStoredValue('_dyid');
      const response = await fetch('/api/email/opt-out', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, dyid: dyid || '' }),
      });

      if (response.ok) {
        showMessage('Successfully opted out of email communications');
        setEmail('');
      } else {
        showMessage('Failed to opt out of email', 'error');
      }
    } catch (error) {
      console.error('Email opt-out error:', error);
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles.backdrop}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={styles.modalContent}
          >
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className={styles.modalBody}>
              <div>
                <h2 className={styles.title}>Configuration</h2>
                <p className={styles.subtitle}>Manage your preferences and permissions</p>
              </div>

              {/* Message Display */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`${styles.message} ${styles[messageType]}`}
                >
                  {messageType === 'success' ? (
                    <CheckCircle2 className={styles.messageIcon} />
                  ) : (
                    <AlertCircle className={styles.messageIcon} />
                  )}
                  <span>{message}</span>
                </motion.div>
              )}

              {/* Web Push Opt-in Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Web Push Notifications</h3>
                <p className={styles.sectionDescription}>
                  Opt-in to receive push notifications about new products and offers
                </p>
                <div className={styles.sectionActions}>
                  <button
                    onClick={handleWebPushOptIn}
                    disabled={isLoading}
                    className={`${styles.btn} ${styles.btnWarning}`}
                  >
                    {isLoading ? 'Processing...' : 'Opt-in'}
                  </button>
                  <button
                    onClick={handleWebPushOptOut}
                    disabled={isLoading}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    {isLoading ? 'Processing...' : 'Opt-out'}
                  </button>
                </div>
              </div>

              {/* Email Opt-in/Opt-out Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Email Communications</h3>
                <p className={styles.sectionDescription}>
                  Manage your email preferences for promotions and updates
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                  placeholder="Enter your email address"
                />
                <div className={styles.sectionActions}>
                  <button
                    onClick={handleEmailOptIn}
                    disabled={isLoading}
                    className={`${styles.btn} ${styles.btnWarning}`}
                  >
                    {isLoading ? 'Processing...' : 'Opt-in'}
                  </button>
                  <button
                    onClick={handleEmailOptOut}
                    disabled={isLoading}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    {isLoading ? 'Processing...' : 'Opt-out'}
                  </button>
                </div>
              </div>

              {/* Clear Cookies Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Clear Session Data</h3>
                <p className={styles.sectionDescription}>
                  Clear DY personalization cookies and session storage (page will reload)
                </p>
                <button
                  onClick={handleClearCookiesAndSession}
                  className={`${styles.btn} ${styles.btnWarning}`}
                >
                  Clear Cookies &amp; Reload
                </button>
              </div>

              {/* Search Terms Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Recent Searches</h3>
                <p className={styles.sectionDescription}>
                  Set up to 10 search terms (one per line)
                </p>
                <textarea
                  value={searchTerms}
                  onChange={(e) => setSearchTerms(e.target.value)}
                  className={styles.textarea}
                  placeholder="Enter search terms, one per line"
                  rows={12}
                  maxLength={500}
                />
                <div className={`${styles.sectionActions} ${styles.searchTermsActions}`}>
                  <button
                    onClick={handleSaveSearchTerms}
                    className={`${styles.btn} ${styles.btnWarning}`}
                  >
                    Save Search Terms
                  </button>
                  <button
                    onClick={handleResetSearchTermsToDefault}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={handleClearRecentSearches}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Reset Push Permission Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Reset Push Permissions</h3>
                <p className={styles.sectionDescription}>
                  Clear push notification permissions and tokens (reload to re-prompt)
                </p>
                <button
                  onClick={handleResetPushPermission}
                  className={`${styles.btn} ${styles.btnWarning}`}
                >
                  Reset Push Permissions
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
