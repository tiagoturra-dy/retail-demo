import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Globe } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../../helpers/currencyConstants';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import styles from './Footer.module.css';

export const Footer = ({ logoText }) => {
  const { currency, setCurrency } = useCurrency();
  const s = styles || {};

  const currencyOptions = CURRENCY_OPTIONS.map(opt => ({
    value: opt.value,
    label: `${opt.label} - ${opt.value}`
  }));

  return (
    <footer className={s.footer}>
      <div className={s.footerContainer}>
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <Link to="/" className={s.footerLogo}>{logoText}</Link>
            <p className={s.footerDescription}>
              Curating the world's finest fashion and lifestyle essentials. Elevate your everyday with our premium collections.
            </p>
            <div className={s.footerSocial}>
              <span className={s.socialIconWrapper}><Instagram className={s.icon} /></span>
              <span className={s.socialIconWrapper}><Twitter className={s.icon} /></span>
              <span className={s.socialIconWrapper}><Facebook className={s.icon} /></span>
              <span className={s.socialIconWrapper}><Youtube className={s.icon} /></span>
            </div>
          </div>

          <div className={s.footerColumn}>
            <h4 className={s.footerHeading}>Shop</h4>
            <ul className={s.footerLinks}>
              <li><Link to="/category/men" className={s.footerLink}>Men's Collection</Link></li>
              <li><Link to="/category/women" className={s.footerLink}>Women's Collection</Link></li>
              <li><Link to="/category/kids" className={s.footerLink}>Kids' Wear</Link></li>
              <li><Link to="/category/beauty" className={s.footerLink}>Beauty & Grooming</Link></li>
            </ul>
          </div>

          <div className={s.footerColumn}>
            <h4 className={s.footerHeading}>Support</h4>
            <ul className={s.footerLinks}>
              <li><span className={s.footerText}>Shipping Policy</span></li>
              <li><span className={s.footerText}>Returns & Exchanges</span></li>
              <li><span className={s.footerText}>Order Tracking</span></li>
              <li><span className={s.footerText}>Contact Us</span></li>
            </ul>
          </div>

          <div className={s.footerColumn}>
            <h4 className={s.footerHeading}>Company</h4>
            <ul className={s.footerLinks}>
              <li><span className={s.footerText}>Our Story</span></li>
              <li><span className={s.footerText}>Careers</span></li>
              <li><span className={s.footerText}>Sustainability</span></li>
              <li><span className={s.footerText}>Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className={s.footerBottom}>
          <p className={s.footerCopyright}>© 2024 {logoText} Commerce Inc. All rights reserved.</p>

          <CustomSelect 
            options={currencyOptions}
            value={currency}
            onChange={setCurrency}
            icon={Globe}
            variant="pill"
          />
        </div>
      </div>
    </footer>
  );
};
