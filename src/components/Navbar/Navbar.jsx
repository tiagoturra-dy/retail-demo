import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ChevronDown, ArrowRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../../constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from '../SearchOverlay/SearchOverlay';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [expandedMobileSection, setExpandedMobileSection] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const toggleMobileCategory = (categoryName) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryName ? null : categoryName);
    setExpandedMobileSection(null);
  };

  const toggleMobileSection = (sectionTitle) => {
    setExpandedMobileSection(expandedMobileSection === sectionTitle ? null : sectionTitle);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-text">LUXE</span>
          </Link>

          {/* Desktop Menu */}
          <div className="navbar-desktop-menu">
            {CATEGORIES.map((category) => (
              <div
                key={category.name}
                className="navbar-item-container"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/category/${category.name.toLowerCase()}`}
                  className="navbar-link"
                >
                  {category.name}
                  <ChevronDown className={`navbar-chevron ${hoveredCategory === category.name ? 'rotate-180' : ''}`} />
                </Link>

                {/* Mega Menu */}
                <AnimatePresence>
                  {hoveredCategory === category.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="mega-menu"
                    >
                      <div className="mega-menu-container">
                        {/* Sections Grid */}
                        <div className="mega-menu-grid">
                          {category.sections.map((section) => (
                            <div key={section.title} className="mega-menu-section">
                              <h3 className="mega-menu-heading">
                                {section.title}
                              </h3>
                              <ul className="mega-menu-list">
                                {section.items.map((item) => (
                                  <li key={item}>
                                    <Link
                                      to={`/category/${category.name.toLowerCase()}?sub=${section.title.toLowerCase()}&item=${item.toLowerCase()}`}
                                      className="mega-menu-link"
                                    >
                                      {item}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Featured Column */}
                        <div className="mega-menu-featured">
                          <div className="featured-image-container">
                            <img
                              src={`https://picsum.photos/seed/${category.name}-featured/800/450`}
                              alt="Featured"
                              className="featured-image"
                            />
                            <div className="featured-overlay" />
                            <div className="featured-text">
                              <p className="featured-label">Editor's Choice</p>
                              <p className="featured-title">The {category.name} Edit</p>
                            </div>
                          </div>
                          
                          <div className="featured-offer">
                            <h4 className="offer-heading">Exclusive Offer</h4>
                            <p className="offer-text">
                              Join our loyalty program and get 15% off your first purchase in the {category.name} collection.
                            </p>
                            <Link to="/login" className="offer-link">
                              Join Now <ArrowRight className="offer-icon" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Icons & Search */}
          <div className="navbar-actions">
            <button onClick={() => setIsSearchOpen(true)} className="action-btn">
              <Search className="action-icon" />
            </button>

            {user ? (
              <button onClick={handleLogout} className="action-btn" title="Log Out">
                <LogOut className="action-icon" />
              </button>
            ) : (
              <Link to="/login" className="action-btn" title="Log In">
                <User className="action-icon" />
              </Link>
            )}
            
            <Link to="/cart" className="action-btn cart-btn">
              <ShoppingBag className="action-icon" />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>

            <button className="mobile-toggle-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="action-icon" /> : <Menu className="action-icon" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="mobile-menu"
          >
            <div className="mobile-menu-container">
              {CATEGORIES.map((category) => (
                <div key={category.name} className="mobile-category">
                  <button onClick={() => toggleMobileCategory(category.name)} className="mobile-category-btn">
                    {category.name}
                    <ChevronDown className={`mobile-chevron ${expandedMobileCategory === category.name ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedMobileCategory === category.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mobile-category-content"
                      >
                        <div className="mobile-sections">
                          {category.sections.map((section) => (
                            <div key={section.title}>
                              <button onClick={() => toggleMobileSection(section.title)} className="mobile-section-btn">
                                {section.title}
                                <ChevronDown className={`mobile-chevron-small ${expandedMobileSection === section.title ? 'rotate-180' : ''}`} />
                              </button>
                              
                              <AnimatePresence>
                                {expandedMobileSection === section.title && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mobile-section-content"
                                  >
                                    <div className="mobile-items-grid">
                                      {section.items.map((item) => (
                                        <Link
                                          key={item}
                                          to={`/category/${category.name.toLowerCase()}?sub=${section.title.toLowerCase()}&item=${item.toLowerCase()}`}
                                          className="mobile-item-link"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          {item}
                                        </Link>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                          
                          <Link
                            to={`/category/${category.name.toLowerCase()}`}
                            className="mobile-shop-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Shop All {category.name}
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <div className="mobile-footer">
                {user ? (
                  <button className="mobile-account-link" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="action-icon" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <Link to="/login" className="mobile-account-link" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="action-icon" />
                    <span>My Account</span>
                  </Link>
                )}
                <div className="mobile-help">
                  <p className="help-heading">Need Help?</p>
                  <p className="help-text">Our customer service team is available 24/7.</p>
                  <button className="help-link">Contact Us</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};
