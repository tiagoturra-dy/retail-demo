import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, Star, Package, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './WelcomeBackPage.css';

export const WelcomeBackPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="welcome-page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="welcome-content"
      >
        <div className="welcome-header">
          <h1 className="welcome-title">Welcome back, {user.name}!</h1>
          <p className="welcome-subtitle">Here is a summary of your account and loyalty status.</p>
        </div>

        <div className="loyalty-card">
          <div className="loyalty-header">
            <div className="loyalty-badge">
              <Award className="loyalty-icon" />
              <span className="loyalty-status">{user.loyaltyStatus}</span>
            </div>
            <div className="points-display">
              <Star className="points-icon" />
              <span className="points-value">{user.points}</span>
              <span className="points-label">Points</span>
            </div>
          </div>
          <div className="loyalty-progress-container">
            <div className="loyalty-progress-bar">
              <div className="loyalty-progress-fill" style={{ width: '75%' }}></div>
            </div>
            <p className="loyalty-progress-text">750 points away from Platinum Tier</p>
          </div>
        </div>

        <div className="account-chips-grid">
          <div className="account-chip">
            <div className="chip-icon-wrapper">
              <Package className="chip-icon" />
            </div>
            <div className="chip-content">
              <h3 className="chip-title">Recent Orders</h3>
              <p className="chip-desc">2 items in transit</p>
            </div>
          </div>
          
          <div className="account-chip">
            <div className="chip-icon-wrapper">
              <User className="chip-icon" />
            </div>
            <div className="chip-content">
              <h3 className="chip-title">Account Info</h3>
              <p className="chip-desc">Manage your details</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping <ArrowRight className="btn-icon" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
