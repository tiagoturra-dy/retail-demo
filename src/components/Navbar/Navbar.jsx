import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ChevronDown, ArrowRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../../constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from '../SearchOverlay/SearchOverlay';
import styles from './Navbar.module.css';

export const Navbar = ({ logoText }) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [expandedMobileSection, setExpandedMobileSection] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  // Safety check for styles
  const s = styles || {};

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
    <nav className={s.navbar}>
      <div className={s.navbarContainer}>
        <div className={s.navbarInner}>
          {/* Logo */}
          <Link to="/" className={s.navbarLogo}>
            <span className={s.navbarLogoText}>{logoText}</span>
          </Link>

          {/* Desktop Menu */}
          <div className={s.navbarDesktopMenu}>
            {CATEGORIES.map((category) => (
              <div
                key={category.name}
                className={s.navbarItemContainer}
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/category/${category.name.toLowerCase()}`}
                  className={s.navbarLink}
                >
                  {category.name}
                  <ChevronDown className={`${s.navbarChevron} ${hoveredCategory === category.name ? s.rotate180 : ''}`} />
                </Link>

                {/* Mega Menu */}
                <AnimatePresence>
                  {hoveredCategory === category.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={s.megaMenu}
                    >
                      <div className={s.megaMenuContainer}>
                        {/* Sections Grid */}
                        <div className={s.megaMenuGrid}>
                          {category.sections.map((section) => (
                            <div key={section.title} className={s.megaMenuSection}>
                              <h3 className={s.megaMenuHeading}>
                                {section.title}
                              </h3>
                              <ul className={s.megaMenuList}>
                                {section.items.map((item) => (
                                  <li key={item}>
                                    <Link
                                      to={`/category/${category.name.toLowerCase()}?sub=${section.title.toLowerCase()}&item=${item.toLowerCase()}`}
                                      className={s.megaMenuLink}
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
                        <div className={s.megaMenuFeatured}>
                          <div className={s.featuredImageContainer}>
                            <img
                              src={`https://picsum.photos/seed/${category.name}-featured/800/450`}
                              alt="Featured"
                              className={s.featuredImage}
                            />
                            <div className={s.featuredOverlay} />
                            <div className={s.featuredText}>
                              <p className={s.featuredLabel}>Editor's Choice</p>
                              <p className={s.featuredTitle}>The {category.name} Edit</p>
                            </div>
                          </div>
                          
                          <div className={s.featuredOffer}>
                            <h4 className={s.offerHeading}>Exclusive Offer</h4>
                            <p className={s.offerText}>
                              Join our loyalty program and get 15% off your first purchase in the {category.name} collection.
                            </p>
                            <Link to="/login" className={s.offerLink}>
                              Join Now <ArrowRight className={s.offerIcon} />
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
          <div className={s.navbarActions}>
            <button onClick={() => setIsSearchOpen(true)} className={s.actionBtn}>
              <Search className={s.actionIcon} />
            </button>

            {user ? (
              <button onClick={handleLogout} className={s.actionBtn} title="Log Out">
                <LogOut className={s.actionIcon} />
              </button>
            ) : (
              <Link to="/login" className={s.actionBtn} title="Log In">
                <User className={s.actionIcon} />
              </Link>
            )}
            
            <Link to="/cart" className={`${s.actionBtn} ${s.cartBtn}`}>
              <ShoppingBag className={s.actionIcon} />
              {totalItems > 0 && (
                <span className={s.cartBadge}>{totalItems}</span>
              )}
            </Link>

            <button className={s.mobileToggleBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className={s.actionIcon} /> : <Menu className={s.actionIcon} />}
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
            className={s.mobileMenu}
          >
            <div className={s.mobileMenuContainer}>
              {CATEGORIES.map((category) => (
                <div key={category.name} className={s.mobileCategory}>
                  <button onClick={() => toggleMobileCategory(category.name)} className={s.mobileCategoryBtn}>
                    {category.name}
                    <ChevronDown className={`${s.mobileChevron} ${expandedMobileCategory === category.name ? s.rotate180 : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedMobileCategory === category.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={s.mobileCategoryContent}
                      >
                        <div className={s.mobileSections}>
                          {category.sections.map((section) => (
                            <div key={section.title}>
                              <button onClick={() => toggleMobileSection(section.title)} className={s.mobileSectionBtn}>
                                {section.title}
                                <ChevronDown className={`${s.mobileChevronSmall} ${expandedMobileSection === section.title ? s.rotate180 : ''}`} />
                              </button>
                              
                              <AnimatePresence>
                                {expandedMobileSection === section.title && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={s.mobileSectionContent}
                                  >
                                    <div className={s.mobileItemsGrid}>
                                      {section.items.map((item) => (
                                        <Link
                                          key={item}
                                          to={`/category/${category.name.toLowerCase()}?sub=${section.title.toLowerCase()}&item=${item.toLowerCase()}`}
                                          className={s.mobileItemLink}
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
                            className={s.mobileShopAll}
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
              
              <div className={s.mobileFooter}>
                {user ? (
                  <button className={s.mobileAccountLink} onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className={s.actionIcon} />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <Link to="/login" className={s.mobileAccountLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <User className={s.actionIcon} />
                    <span>My Account</span>
                  </Link>
                )}
                <div className={s.mobileHelp}>
                  <p className={s.mobileHelpHeading}>Need Help?</p>
                  <p className={s.mobileHelpText}>Our customer service team is available 24/7.</p>
                  <button className={s.mobileHelpLink}>Contact Us</button>
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
