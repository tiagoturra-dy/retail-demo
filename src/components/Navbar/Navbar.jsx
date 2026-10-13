import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Search, Menu, X, LogOut, LayoutDashboard, BotMessageSquare, IdCard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from '../SearchOverlay/SearchOverlay';
import { ConfigurationOverlay } from '../ConfigurationOverlay/ConfigurationOverlay';
import { useMuse } from '../../context/MuseContext';
import { BlueberryLogo } from '../../icons/BlueberryLogo/BlueberryLogo';
import styles from './Navbar.module.css';
import { MuseIcon } from '../../icons/MuseIcon/MuseIcon';
import { BagIcon } from '../../icons/BagIcon/BagIcon';
import { Helper } from '../../helpers/helper';
import { MiniCart } from '../MiniCart/MiniCart';

export const Navbar = ({ logoText }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [overlayInitialQuery, setOverlayInitialQuery] = useState('');
  const [previewPosition, setPreviewPosition] = useState(null);
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewNotificationRef = useRef(null);
  const miniCartRegionRef = useRef(null);
  const { totalItems, lastAdded, clearLastAdded, subtotal } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const { openMuse } = useMuse();
  const isSearchPage = location.pathname === '/search';
  const searchInitialQuery = isSearchPage
    ? new URLSearchParams(location.search).get('q') || ''
    : '';

  useEffect(() => {
    if (lastAdded) {
      setIsMiniCartOpen(true);
    }
  }, [lastAdded]);

  useEffect(() => {
    if (!isMiniCartOpen) return;

    const handlePointerDown = (event) => {
      if (!miniCartRegionRef.current?.contains(event.target)) {
        setIsMiniCartOpen(false);
        clearLastAdded();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMiniCartOpen(false);
        clearLastAdded();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMiniCartOpen, clearLastAdded]);

  const closeMiniCart = () => {
    setIsMiniCartOpen(false);
    clearLastAdded();
  };

  const handleMiniCartBlur = (event) => {
    if (!miniCartRegionRef.current?.contains(event.relatedTarget)) {
      closeMiniCart();
    }
  };

  // Safety check for styles
  const s = styles || {};

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleExitPreview = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('dyApiPreview');
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.location.href = newUrl;
  };

  const handlePreviewMouseDown = (e) => {
    if (e.target.closest('button')) return;
    const rect = previewNotificationRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left || 0),
      y: e.clientY - (rect?.top || 0)
    });
    setIsDraggingPreview(true);
  };

  useEffect(() => {
    if (!isDraggingPreview) return;

    const handleMouseMove = (e) => {
      const rect = previewNotificationRef.current?.getBoundingClientRect();
      const width = rect?.width || 0;
      const height = rect?.height || 0;
      const maxLeft = window.innerWidth - width - 8;
      const maxTop = window.innerHeight - height - 8;
      setPreviewPosition({
        left: Math.min(Math.max(8, e.clientX - dragOffset.x), maxLeft),
        top: Math.min(Math.max(8, e.clientY - dragOffset.y), maxTop)
      });
    };

    const handleMouseUp = () => {
      setIsDraggingPreview(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPreview, dragOffset]);

  useEffect(() => {
    const handleOpenSearch = (e) => {
      if (e.detail?.query) setOverlayInitialQuery(e.detail.query);
      setIsSearchOpen(true);
    };
    window.addEventListener('open-search-overlay', handleOpenSearch);
    return () => window.removeEventListener('open-search-overlay', handleOpenSearch);
  }, []);

  return (
    <>
      {/* Preview Mode Floating Notification */}
      {Helper.isInDyApiPreviewMode() && (
        <div
          ref={previewNotificationRef}
          className={`${styles.previewNotification} dy-preview-notif ${isDraggingPreview ? styles.dragging : ''}`}
          style={previewPosition ? {
            left: `${previewPosition.left}px`,
            top: `${previewPosition.top}px`,
            right: 'auto'
          } : undefined}
          onMouseDown={handlePreviewMouseDown}
        >
          <div className={styles.previewNotificationHeader}>
            <span className={styles.previewNotificationIcon} aria-hidden="true">DY</span>
            <span className={styles.previewNotificationHeading}>Dynamic Yield Preview</span>
          </div>
          <p className={styles.previewNotificationText}>
            You're viewing campaign token <strong>{Helper.getDyApiPreviewToken()?.slice(0, 8)}...</strong>
          </p>
          <button
            className={styles.previewNotificationClose}
            onClick={handleExitPreview}
            title="Exit preview mode"
          >
            Exit preview
          </button>
        </div>
      )}
      <nav className={`${s.navbar} dy-nav`}>
      <div className={s.navbarContainer}>
        <div className={s.navbarInner}>
          {/* Hamburger — left on mobile */}
          <button className={s.mobileToggleBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className={s.actionIcon} />
          </button>

          {/* Logo */}
          <Link to="/" className={s.navbarLogo}>
            <BlueberryLogo />
          </Link>

          {/* Search — embedded input on /search, full overlay elsewhere */}
          <SearchOverlay
            embedded={isSearchPage && !isSearchOpen}
            isOpen={isSearchOpen}
            onClose={() => { setIsSearchOpen(false); setOverlayInitialQuery(''); }}
            onOpen={() => setIsSearchOpen(true)}
            initialQuery={isSearchOpen ? overlayInitialQuery : searchInitialQuery}
          />

          {/* Configuration Overlay */}
          <ConfigurationOverlay
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
          />

          {/* Icons & Search */}
          <div className={`dy-nav-icons ${s.navbarActions}`}>

            <button onClick={() => openMuse()} className={`${s.actionBtn} ${s.desktopOnly}`} title="Shopper Assistant" data-dy-nav-icon="muse">
              <MuseIcon className={`dy-nav-icon ${s.actionIcon}`} color="currentColor" />
            </button>

            <button onClick={() => setIsConfigOpen(true)} className={`${s.actionBtn} ${s.desktopOnly}`} title="Configuration" data-dy-nav-icon="settings">
              <Settings className={`dy-nav-icon ${s.actionIcon}`} />
            </button>

            {!isSearchPage && (
              <button onClick={() => setIsSearchOpen(true)} className={s.actionBtn} data-dy-nav-icon="search">
                <Search className={`dy-nav-icon ${s.actionIcon}`} />
              </button>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin" className={`${s.actionBtn} ${s.desktopOnly}`} title="Admin Dashboard" data-dy-nav-icon="admin">
                <LayoutDashboard className={`dy-nav-icon ${s.actionIcon}`} />
              </Link>
            )}

            {user && user.role !== 'admin' && (
              <Link to="/welcome" className={`${s.actionBtn} ${s.desktopOnly}`} title="Dashboard" data-dy-nav-icon="dashboard">
                <IdCard className={`dy-nav-icon ${s.actionIcon}`} />
              </Link>
            )}

            {user ? (
              <button onClick={handleLogout} className={`${s.actionBtn} ${s.desktopOnly}`} title="Log Out" data-dy-nav-icon="logout">
                <LogOut className={`dy-nav-icon ${s.actionIcon}`} />
              </button>
            ) : (
              <Link to="/login" className={`${s.actionBtn} ${s.desktopOnly}`} title="Log In" data-dy-nav-icon="login">
                <User className={`dy-nav-icon ${s.actionIcon}`} />
              </Link>
            )}
            
            <div
              ref={miniCartRegionRef}
              className={s.miniCartRegion}
              onMouseEnter={() => setIsMiniCartOpen(true)}
              onMouseLeave={closeMiniCart}
              onFocus={() => setIsMiniCartOpen(true)}
              onBlur={handleMiniCartBlur}
            >
              <Link to="/cart" className={`${s.actionBtn} ${s.cartBtn}`} data-dy-nav-icon="cart">
                <BagIcon className={`dy-nav-icon ${s.actionIcon}`} />
                {totalItems > 0 && (
                  <span className={`${s.cartBadge} cart-badge`} cart-total-items={totalItems || 0} cart-subtotal={subtotal}>{totalItems}</span>
                )}
              </Link>
              <MiniCart
                isOpen={isMiniCartOpen}
                onClose={closeMiniCart}
                onMouseEnter={() => setIsMiniCartOpen(true)}
                onMouseLeave={closeMiniCart}
              />
            </div>
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
              <div className={s.mobileMenuHeader}>
                <button className={s.mobileCloseBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <X className={s.actionIcon} />
                </button>
              </div>

              <div className={s.mobileFooter}>
                <button onClick={() => { openMuse(); setIsMobileMenuOpen(false); }} className={s.mobileAccountLink}>
                  <MuseIcon className={s.actionIcon} color="currentColor" />
                  <span>Shopper Assistant</span>
                </button>

                <button onClick={() => { setIsConfigOpen(true); setIsMobileMenuOpen(false); }} className={s.mobileAccountLink}>
                  <Settings className={s.actionIcon} />
                  <span>Configuration</span>
                </button>

                {user && user.role === 'admin' && (
                  <Link to="/admin" className={s.mobileAccountLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <LayoutDashboard className={s.actionIcon} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {user && user.role !== 'admin' && (
                  <Link to="/welcome" className={s.mobileAccountLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <IdCard className={s.actionIcon} />
                    <span>My Dashboard</span>
                  </Link>
                )}

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
      </nav>
    </>
  );
};
