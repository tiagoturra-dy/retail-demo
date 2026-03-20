import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer id="main-footer" className="bg-white border-t border-zinc-100 pt-20 pb-10 main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div id="footer-brand" className="space-y-6 footer-column">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-zinc-900 cursor-pointer">LUXE</Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Curating the world's finest fashion and lifestyle essentials since 2024. Elevate your everyday with our premium collections.
            </p>
            <div id="footer-social" className="flex gap-4 social-links">
              <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          <div id="footer-shop" className="footer-column">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/category/men" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Men's Collection</Link></li>
              <li><Link to="/category/women" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Women's Collection</Link></li>
              <li><Link to="/category/kids" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Kids' Wear</Link></li>
              <li><Link to="/category/beauty" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Beauty & Grooming</Link></li>
            </ul>
          </div>

          <div id="footer-support" className="footer-column">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Shipping Policy</a></li>
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Returns & Exchanges</a></li>
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Order Tracking</a></li>
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Contact Us</a></li>
            </ul>
          </div>

          <div id="footer-company" className="footer-column">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Our Story</a></li>
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Careers</a></li>
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Sustainability</a></li>
              <li><a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div id="footer-bottom" className="pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400">© 2024 LUXE Commerce Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

