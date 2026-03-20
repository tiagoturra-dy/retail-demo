import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="not-found-content"
      >
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary-btn">
            Back to Home <ArrowRight className="btn-icon" />
          </Link>
          <Link to="/search" className="not-found-btn secondary-btn">
            Search Products <Search className="btn-icon" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
