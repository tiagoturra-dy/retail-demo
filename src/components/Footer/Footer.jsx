import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Globe, ChevronDown } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../../helpers/currencyConstants';
import styles from './Footer.module.css';

export const Footer = ({ logoText }) => {
  const { currency, setCurrency } = useCurrency();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const dropdownRef = useRef(null);
  const s = styles || {};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCurrency = CURRENCY_OPTIONS.find(opt => opt.value === currency) || CURRENCY_OPTIONS[0];

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

          <div className={s.currencySelectorContainer} ref={dropdownRef}>
            <button 
              className={s.currencyButton} 
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              aria-expanded={isCurrencyOpen}
              aria-haspopup="listbox"
            >
              <Globe className={s.globeIcon} size={16} />
              <span className={s.currencyText}>{selectedCurrency.label} - {selectedCurrency.value}</span>
              <ChevronDown size={14} className={`${s.chevronIcon} ${isCurrencyOpen ? s.chevronOpen : ''}`} />
            </button>
            
            {isCurrencyOpen && (
              <ul className={s.currencyDropdown} role="listbox">
                {CURRENCY_OPTIONS.map((option) => (
                  <li 
                    key={option.value} 
                    role="option"
                    aria-selected={currency === option.value}
                    className={`${s.currencyOption} ${currency === option.value ? s.currencyOptionSelected : ''}`}
                    onClick={() => {
                      setCurrency(option.value);
                      setIsCurrencyOpen(false);
                    }}
                  >
                    {option.label} - {option.value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
