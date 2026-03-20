import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">LUXE</Link>
            <p className="footer-description">
              Curating the world's finest fashion and lifestyle essentials since 2024. Elevate your everyday with our premium collections.
            </p>
            <div className="footer-social">
              <span className="social-icon-wrapper"><Instagram className="icon" /></span>
              <span className="social-icon-wrapper"><Twitter className="icon" /></span>
              <span className="social-icon-wrapper"><Facebook className="icon" /></span>
              <span className="social-icon-wrapper"><Youtube className="icon" /></span>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li><Link to="/category/men" className="footer-link">Men's Collection</Link></li>
              <li><Link to="/category/women" className="footer-link">Women's Collection</Link></li>
              <li><Link to="/category/kids" className="footer-link">Kids' Wear</Link></li>
              <li><Link to="/category/beauty" className="footer-link">Beauty & Grooming</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><span className="footer-text">Shipping Policy</span></li>
              <li><span className="footer-text">Returns & Exchanges</span></li>
              <li><span className="footer-text">Order Tracking</span></li>
              <li><span className="footer-text">Contact Us</span></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><span className="footer-text">Our Story</span></li>
              <li><span className="footer-text">Careers</span></li>
              <li><span className="footer-text">Sustainability</span></li>
              <li><span className="footer-text">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2024 LUXE Commerce Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
