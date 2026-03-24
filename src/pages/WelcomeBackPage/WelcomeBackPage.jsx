import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, Star, Package, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './WelcomeBackPage.module.css';

export const WelcomeBackPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className={styles.welcomePageContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.welcomeContent}
      >
        <div className={styles.welcomeHeader}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user.Name || user.name}!</h1>
          <p className={styles.welcomeSubtitle}>Here is a summary of your account and loyalty status.</p>
        </div>

        <div className={styles.loyaltyCard}>
          <div className={styles.loyaltyHeader}>
            <div className={styles.loyaltyBadge}>
              <Award className={styles.loyaltyIcon} />
              <span className={styles.loyaltyStatus}>{user.LoyaltyLevel || 'Bronze'}</span>
            </div>
            <div className={styles.pointsDisplay}>
              <Star className={styles.pointsIcon} />
              <span className={styles.pointsValue}>{user.LoyaltyPoints || 0}</span>
              <span className={styles.pointsLabel}>Points</span>
            </div>
          </div>
          <div className={styles.loyaltyProgressContainer}>
            <div className={styles.loyaltyProgressBar}>
              <div className={styles.loyaltyProgressFill} style={{ width: '75%' }}></div>
            </div>
            <p className={styles.loyaltyProgressText}>Membership Number: {user.MembershipNumber}</p>
          </div>
        </div>

        <div className={styles.accountChipsGrid}>
          <div className={styles.accountChip}>
            <div className={styles.chipIconWrapper}>
              <Package className={styles.chipIcon} />
            </div>
            <div className={styles.chipContent}>
              <h3 className={styles.chipTitle}>Recent Purchase</h3>
              <p className={styles.chipDesc}>{user.RecentPurchaseName || 'No recent purchases'}</p>
            </div>
          </div>
          
          <div className={styles.accountChip}>
            <div className={styles.chipIconWrapper}>
              <User className={styles.chipIcon} />
            </div>
            <div className={styles.chipContent}>
              <h3 className={styles.chipTitle}>Location</h3>
              <p className={styles.chipDesc}>{user.Location}</p>
            </div>
          </div>
        </div>

        <div className={styles.welcomeActions}>
          <Link to="/" className={styles.continueShoppingBtn}>
            Continue Shopping <ArrowRight className={styles.btnIcon} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
