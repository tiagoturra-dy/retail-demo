import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, Star, Package, User, ArrowRight, MapPinned } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { LOYALTY_TIERS } from '../../helpers/users';
import styles from './WelcomeBackPage.module.css';

export const WelcomeBackPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentPoints = parseInt(user.LoyaltyPoints, 10);
  const currentTierIndex = TIER_ORDER.indexOf(user.LoyaltyLevel);
  const isTopTier = currentTierIndex === TIER_ORDER.length - 1;
  const nextTier = isTopTier ? null : TIER_ORDER[currentTierIndex + 1];
  const progressPercent = isTopTier
    ? 100
    : Math.min(
        100,
        Math.round(
          ((currentPoints - LOYALTY_TIERS[user.LoyaltyLevel].min) /
            (LOYALTY_TIERS[nextTier].min - LOYALTY_TIERS[user.LoyaltyLevel].min)) *
            100
        )
      );
  const pointsToNext = isTopTier ? 0 : Math.max(0, LOYALTY_TIERS[nextTier].min - currentPoints);

  // window.__getLoyaltyInfo()
  useEffect(() => {
    window.__getLoyaltyInfo = () => ({
      loyaltyLevel: user.LoyaltyLevel,
      loyaltyPoints: currentPoints,
      membershipNumber: user.MembershipNumber,
      nextTier,
      pointsToNext,
      progressPercent,
    });
    return () => {
      delete window.__getLoyaltyInfo;
    };
  }, [user, currentPoints, nextTier, pointsToNext, progressPercent]);

  return (
    <div className={styles.welcomePageContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.welcomeContent}
      >
        <div className={styles.welcomeHeader}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user.DisplayName || user.Name}!</h1>
          <p className={styles.welcomeSubtitle}>Here is a summary of your account and loyalty status.</p>
        </div>

        <div className={styles.loyaltyCard}>
          <div className={styles.loyaltyHeader}>
            <div className={styles.loyaltyBadge}>
              <Award className={styles.loyaltyIcon} />
              <span className={styles.loyaltyStatus}>{user.LoyaltyLevel}</span>
            </div>
            <div className={styles.pointsDisplay}>
              <Star className={styles.pointsIcon} />
              <span className={styles.pointsValue}>{formatPrice(user.LoyaltyPoints, 'points')}</span>
              <span className={styles.pointsLabel}>Points</span>
            </div>
          </div>
          <div className={styles.loyaltyProgressContainer}>
            <div className={styles.loyaltyProgressBar}>
              <div className={styles.loyaltyProgressFill} style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className={styles.loyaltyProgressText}>
              {isTopTier
                ? 'You have reached the highest loyalty tier!'
                : `${pointsToNext.toLocaleString()} points to ${nextTier}`}
            </p>
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
              <MapPinned className={styles.chipIcon} />
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

        <div className={`${styles.dyPlaceholder} dy-for-you`}></div>
        <div className={`${styles.dyPlaceholder} dy-recent-viewed`}></div>
        <div className={`${styles.dyPlaceholder} dy-recent-purchased`}></div>
        <div className={`${styles.dyPlaceholder} dy-cross-sell`}></div>
        <div className={`${styles.dyPlaceholder} dy-replenishment`}></div>
        <div className={`${styles.dyPlaceholder} dy-content`}></div>
        <div className={`${styles.dyPlaceholder} dy-benefits`}></div>
      </motion.div>

    </div>
  );
};
