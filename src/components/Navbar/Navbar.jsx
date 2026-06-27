import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LogOut, LayoutDashboard, BotMessageSquare, IdCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from '../SearchOverlay/SearchOverlay';
import { useMuse } from '../../context/MuseContext';
import { BlueberryLogo } from '../../icons/BlueberryLogo/BlueberryLogo';
import styles from './Navbar.module.css';
import { MuseIcon } from '../../icons/MuseIcon/MuseIcon';

export const Navbar = ({ logoText }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems, lastAdded, clearLastAdded } = useCart();
  const { user, logout } = useAuth();
  const { openMuse } = useMuse();

  // Auto-dismiss popup after 4 seconds
  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(clearLastAdded, 4000);
    return () => clearTimeout(t);
  }, [lastAdded]);

  // Safety check for styles
  const s = styles || {};

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-search-overlay', handleOpenSearch);
    return () => window.removeEventListener('open-search-overlay', handleOpenSearch);
  }, []);

  return (
    <nav className={`${s.navbar} dy-nav`}>
      <div className={s.navbarContainer}>
        <div className={s.navbarInner}>
          {/* Logo */}
          <Link to="/" className={s.navbarLogo}>
            <BlueberryLogo />
          </Link>

          {/* Icons & Search */}
          <div className={`dy-nav-icons ${s.navbarActions}`}>

            <button onClick={() => openMuse()} className={s.actionBtn} title="Shopper Assistant" data-dy-nav-icon="muse">
              {/* <BotMessageSquare className={`dy-nav-icon ${s.actionIcon}`} /> */}
              <MuseIcon className={`dy-nav-icon ${s.actionIcon}`} color="currentColor" />
            </button>

            <button onClick={() => setIsSearchOpen(true)} className={s.actionBtn} data-dy-nav-icon="search">
              <Search className={`dy-nav-icon ${s.actionIcon}`} />
            </button>

            {user && user.role === 'admin' && (
              <Link to="/admin" className={s.actionBtn} title="Admin Dashboard" data-dy-nav-icon="admin">
                <LayoutDashboard className={`dy-nav-icon ${s.actionIcon}`} />
              </Link>
            )}

            {user && user.role !== 'admin' && (
              <Link to="/welcome" className={s.actionBtn} title="Dashboard" data-dy-nav-icon="dashboard">
                <IdCard className={`dy-nav-icon ${s.actionIcon}`} />
              </Link>
            )}

            {user ? (
              <button onClick={handleLogout} className={s.actionBtn} title="Log Out" data-dy-nav-icon="logout">
                <LogOut className={`dy-nav-icon ${s.actionIcon}`} />
              </button>
            ) : (
              <Link to="/login" className={s.actionBtn} title="Log In" data-dy-nav-icon="login">
                <User className={`dy-nav-icon ${s.actionIcon}`} />
              </Link>
            )}
            
            <Link to="/cart" className={`${s.actionBtn} ${s.cartBtn}`} data-dy-nav-icon="cart">
              <ShoppingBag className={`dy-nav-icon ${s.actionIcon}`} />
              {totalItems > 0 && (
                <span className={s.cartBadge}>{totalItems}</span>
              )}
            </Link>

            {/* Added to Bag popup */}
            <AnimatePresence>
              {lastAdded && (
                <motion.div
                  className={s.addedToBagPopup}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className={s.popupHeader}>
                    <span className={s.popupTitle}>Added To Bag</span>
                  </div>
                  <div className={s.popupItem}>
                    <img
                      src={lastAdded.image_url || lastAdded.image}
                      alt={lastAdded.name}
                      className={s.popupItemImage}
                    />
                    <div className={s.popupItemInfo}>
                      <div className={s.popupItemTopRow}>
                        <span className={s.popupItemName}>{lastAdded.name}</span>
                        <button className={s.popupClose} onClick={clearLastAdded} aria-label="Close">✕</button>
                      </div>
                      {lastAdded.color && <p className={s.popupItemAttr}>Color: {lastAdded.color}</p>}
                      {lastAdded.size && <p className={s.popupItemAttr}>Size: {lastAdded.size}</p>}
                      <p className={s.popupItemPrice}>${lastAdded.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={s.popupActions}>
                    <Link to="/cart" className={s.popupGoToBag} onClick={clearLastAdded}>GO TO BAG</Link>
                    <Link to="/checkout" className={s.popupCheckout} onClick={clearLastAdded}>CHECKOUT</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              <div className={s.mobileCategory}>
                <Link to="/my-page" className={s.mobileCategoryBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  My Page
                </Link>
              </div>

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
