import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
  return (
    <div className={styles.notFoundContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.notFoundContent}
      >
        <h1 className={styles.notFoundTitle}>404</h1>
        <h2 className={styles.notFoundSubtitle}>Page Not Found</h2>
        <p className={styles.notFoundText}>
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className={styles.notFoundActions}>
          <Link to="/" className={`${styles.notFoundBtn} ${styles.primaryBtn}`}>
            Back to Home <ArrowRight className={styles.btnIcon} />
          </Link>
          <Link to="/search" className={`${styles.notFoundBtn} ${styles.secondaryBtn}`}>
            Search Products <Search className={styles.btnIcon} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
