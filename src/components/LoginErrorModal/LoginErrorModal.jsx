import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import styles from './LoginErrorModal.module.css';

export const LoginErrorModal = ({ isOpen, onClose, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modalContent}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
            
            <div className={styles.modalBody}>
              <div className={styles.iconWrapper}>
                <AlertCircle className={styles.errorIcon} size={32} />
              </div>
              <h2 className={styles.modalTitle}>Login Failed</h2>
              <p className={styles.modalMessage}>{message}</p>
              <button className={styles.confirmBtn} onClick={onClose}>
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
