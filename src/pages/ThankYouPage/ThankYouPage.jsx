import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './ThankYouPage.module.css';

export const ThankYouPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-UNKNOWN';

  return (
    <div className={styles.thankYouContainer}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.thankYouContent}
      >
        <div className={styles.successIconWrapper}>
          <CheckCircle className={styles.successIcon} />
        </div>
        <h1 className={styles.thankYouTitle}>Thank You for Your Order!</h1>
        <p className={styles.thankYouMessage}>
          Your order <span className={styles.orderId}>{orderId}</span> has been placed successfully.
        </p>
        <p className={styles.thankYouDetails}>
          We've sent a confirmation email with all the details. We'll notify you as soon as your items are on their way.
        </p>
        <div className={styles.actionContainer}>
          <Link
            to="/"
            className={styles.continueShoppingBtn}
          >
            Continue Shopping <ArrowRight className={styles.btnIcon} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
