import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import './ThankYouPage.css';

export const ThankYouPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-UNKNOWN';

  return (
    <div className="thank-you-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="thank-you-content"
      >
        <div className="success-icon-wrapper">
          <CheckCircle className="success-icon" />
        </div>
        <h1 className="thank-you-title">Thank You for Your Order!</h1>
        <p className="thank-you-message">
          Your order <span className="order-id">{orderId}</span> has been placed successfully.
        </p>
        <p className="thank-you-details">
          We've sent a confirmation email with all the details. We'll notify you as soon as your items are on their way.
        </p>
        <div className="action-container">
          <Link
            to="/"
            className="continue-shopping-btn"
          >
            Continue Shopping <ArrowRight className="btn-icon" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
