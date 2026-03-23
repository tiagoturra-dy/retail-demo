import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Remove",
  cancelText = "Cancel",
  type = "danger"
}) => {
  const messageParts = message.split(/"(.*?)"/g);

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modalContent}
          >
            <button 
              onClick={onClose}
              className={styles.closeButton}
            >
              <X className="h-5 w-5" />
            </button>

            <div className={styles.modalBody}>
              <div className={`${styles.iconWrapper} ${type === 'danger' ? styles.iconDanger : styles.iconDefault}`}>
                <AlertTriangle className="h-7 w-7" />
              </div>
              
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.message}>{
                messageParts.map((part, index) => {
                  if (index % 2 === 1) {
                    return (
                      <strong key={index}>{part}</strong>
                    );
                  }
                  return part
                })}
              </p>

              <div className={styles.buttonGroup}>
                <button
                  onClick={onClose}
                  className={`${styles.btn} ${styles.btnCancel}`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`${styles.btn} ${styles.btnConfirm} ${type === 'danger' ? styles.btnDanger : styles.btnDefault}`}
                >
                  {confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
