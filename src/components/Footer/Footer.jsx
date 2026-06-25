import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import PayPal from './logos/PayPal.png';
import ApplePay from './logos/ApplePay.png';
import GooglePay from './logos/GooglePay.png';
import Klarna from './logos/Klarna.png';
import { BlueberryLogo } from '../BlueberryLogo/BlueberryLogo';
import styles from './Footer.module.css';

export const Footer = ({ logoText }) => {
  const s = styles || {};
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email) {
      console.log('Subscribed with email:', email);
      setEmail('');
    }
  };

  return (
    <footer className={s.footer}>
      <div className={s.footerContainer}>
        {/* Logo and Payment Methods */}
        <div className={s.headerSection}>
          <Link to="/" className={s.footerLogo}>
            <BlueberryLogo size={128} />
          </Link>
          <div className={s.paymentMethods}>
            <span className={s.paymentBadge}>
              <img src={PayPal} alt="PayPal" className={s.paymentIcon} />
            </span>
            <span className={s.paymentBadge}>
              <img src={ApplePay} alt="Apple Pay" className={s.paymentIcon} />
            </span>
            <span className={s.paymentBadge}>
              <img src={GooglePay} alt="Google Pay" className={s.paymentIcon} />
            </span>
            <span className={s.paymentBadge}>
              <img src={Klarna} alt="Klarna" className={s.paymentIcon} />
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className={s.mainContent}>
          {/* Links Section */}
          <div className={s.linksGrid}>
            <div className={s.column}>
              <h4 className={s.columnHeading}>Shop</h4>
              <ul className={s.footerLinks}>
                <li><Link to="/category/women" className={s.footerLink}>Women</Link></li>
                <li><Link to="/category/men" className={s.footerLink}>Men</Link></li>
                <li><Link to="/category/home" className={s.footerLink}>Home</Link></li>
                {/* <li><Link to="/category/electronics" className={s.footerLink}>Electronics</Link></li> */}
              </ul>
            </div>

            <div className={s.column}>
              <h4 className={s.columnHeading}>Help</h4>
              <ul className={s.footerLinks}>
                <li><span className={s.footerText}>Customer Service</span></li>
                <li><span className={s.footerText}>Delivery Information</span></li>
                <li><span className={s.footerText}>Return an Order</span></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className={s.newsletter}>
            <h4 className={s.newsletterHeading}>Subscribe</h4>
            <p className={s.newsletterDesc}>Join our newsletter to stay up to date on features and releases.</p>
            
            <div className={s.subscriberForm}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={s.emailInput}
              />
              <button onClick={handleSubscribe} className={s.subscribeBtn}>Subscribe</button>
            </div>

            <p className={s.privacyText}>
              By subscribing you agree to with our <Link to="#" className={s.privacyLink}>Privacy Policy</Link> and provide consent to receive updates from our company.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={s.footerBottom}>
          <div className={s.bottomContent}>
            <p className={s.copyright}>© 2026. All rights reserved.</p>
            <div className={s.bottomLinks}>
              <Link to="#" className={s.bottomLink}>Privacy Policy</Link>
              <Link to="#" className={s.bottomLink}>Terms of Service</Link>
              <Link to="#" className={s.bottomLink}>Cookies Settings</Link>
            </div>
          </div>

          <div className={s.socialLinks}>
            <a href="#" className={s.socialIcon} aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" className={s.socialIcon} aria-label="Instagram"><Instagram size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};
