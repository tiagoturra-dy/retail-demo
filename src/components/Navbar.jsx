import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { useCart } from '../context/CartContext';

import { SearchOverlay } from './SearchOverlay';

export const Navbar = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav id="main-navbar" className="sticky top-0 z-50 w-full bg-white border-b border-zinc-100 main-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" id="nav-logo" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold tracking-tighter text-zinc-900">LUXE</span>
          </Link>

          {/* Desktop Menu */}
          <div id="nav-desktop-menu" className="hidden lg:flex space-x-8 h-full items-center">
            {CATEGORIES.map((category) => (
              <div
                key={category.name}
                id={`nav-item-${category.name.toLowerCase()}`}
                className="h-full flex items-center nav-item-container"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/category/${category.name.toLowerCase()}`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {category.name}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Link>

                {/* Mega Menu */}
                <AnimatePresence>
                  {hoveredCategory === category.name && (
                    <motion.div
                      id={`mega-menu-${category.name.toLowerCase()}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-20 left-0 w-full bg-white border-b border-zinc-100 shadow-xl mega-menu"
                    >
                      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-4 gap-8">
                        <div className="mega-menu-column">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                            Shop {category.name}
                          </h3>
                          <ul className="space-y-3">
                            {category.subcategories.map((sub) => (
                              <li key={sub}>
                                <Link
                                  to={`/category/${category.name.toLowerCase()}?sub=${sub.toLowerCase()}`}
                                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                                >
                                  {sub}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4 mega-menu-featured">
                          <div className="aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden relative group">
                            <img
                              src={`https://picsum.photos/seed/${category.name}-1/400/500`}
                              alt="Featured"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute bottom-6 left-6 text-white">
                              <p className="text-xs font-bold uppercase tracking-widest mb-1">New Arrivals</p>
                              <p className="text-xl font-medium">Spring Collection</p>
                            </div>
                          </div>
                          <div className="aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden relative group">
                            <img
                              src={`https://picsum.photos/seed/${category.name}-2/400/500`}
                              alt="Featured"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute bottom-6 left-6 text-white">
                              <p className="text-xs font-bold uppercase tracking-widest mb-1">Trending</p>
                              <p className="text-xl font-medium">Must-Haves</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-zinc-50 rounded-xl p-8 flex flex-col justify-center mega-menu-promo">
                          <h4 className="text-lg font-medium mb-2">Free Shipping</h4>
                          <p className="text-sm text-zinc-500 mb-6">On all orders over $150. Limited time offer.</p>
                          <Link
                            to="/category/all"
                            className="text-sm font-bold underline underline-offset-4 cursor-pointer"
                          >
                            Shop All
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Icons & Search */}
          <div id="nav-actions" className="flex items-center space-x-6">
            <button
              id="nav-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/login" id="nav-user-btn" className="text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/cart" id="nav-cart-btn" className="text-zinc-600 hover:text-zinc-900 transition-colors relative cursor-pointer">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              id="nav-mobile-toggle"
              className="lg:hidden text-zinc-600 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {CATEGORIES.map((category) => (
                <div key={category.name} className="mobile-nav-section">
                  <Link
                    to={`/category/${category.name.toLowerCase()}`}
                    className="text-lg font-medium block cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  <div className="mt-2 ml-4 flex flex-wrap gap-x-4 gap-y-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        to={`/category/${category.name.toLowerCase()}?sub=${sub.toLowerCase()}`}
                        className="text-sm text-zinc-500 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

