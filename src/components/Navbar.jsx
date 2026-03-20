import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { useCart } from '../context/CartContext';

import { SearchOverlay } from './SearchOverlay';

export const Navbar = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [expandedMobileSection, setExpandedMobileSection] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();

  const toggleMobileCategory = (categoryName) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryName ? null : categoryName);
    setExpandedMobileSection(null);
  };

  const toggleMobileSection = (sectionTitle) => {
    setExpandedMobileSection(expandedMobileSection === sectionTitle ? null : sectionTitle);
  };

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
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer py-8"
                >
                  {category.name}
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 opacity-50", hoveredCategory === category.name && "rotate-180")} />
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
                      className="absolute top-20 left-0 w-full bg-white border-b border-zinc-100 shadow-2xl mega-menu"
                    >
                      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-12 gap-12">
                        {/* Sections Grid */}
                        <div className="col-span-8 grid grid-cols-3 gap-x-8 gap-y-10">
                          {category.sections.map((section) => (
                            <div key={section.title} className="mega-menu-section">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-5 border-b border-zinc-100 pb-2">
                                {section.title}
                              </h3>
                              <ul className="space-y-3">
                                {section.items.map((item) => (
                                  <li key={item}>
                                    <Link
                                      to={`/category/${category.name.toLowerCase()}?sub=${section.title.toLowerCase()}&item=${item.toLowerCase()}`}
                                      className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block"
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
                        <div className="col-span-4 space-y-6">
                          <div className="aspect-[16/9] bg-zinc-100 rounded-2xl overflow-hidden relative group cursor-pointer">
                            <img
                              src={`https://picsum.photos/seed/${category.name}-featured/800/450`}
                              alt="Featured"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-6 left-6 text-white">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">Editor's Choice</p>
                              <p className="text-xl font-medium tracking-tight">The {category.name} Edit</p>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-2">Exclusive Offer</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                              Join our loyalty program and get 15% off your first purchase in the {category.name} collection.
                            </p>
                            <Link
                              to="/login"
                              className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-zinc-900 hover:gap-2 transition-all"
                            >
                              Join Now <ArrowRight className="w-3 h-3 ml-1" />
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
          <div id="nav-actions" className="flex items-center space-x-5">
            <button
              id="nav-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer rounded-full hover:bg-zinc-50"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/login" id="nav-user-btn" className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer rounded-full hover:bg-zinc-50">
              <User className="w-5 h-5" />
            </Link>
            
            <Link to="/cart" id="nav-cart-btn" className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors relative cursor-pointer rounded-full hover:bg-zinc-50">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-zinc-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              id="nav-mobile-toggle"
              className="lg:hidden p-2 text-zinc-600 cursor-pointer rounded-full hover:bg-zinc-50"
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-20 z-40 bg-white lg:hidden overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-6">
              {CATEGORIES.map((category) => (
                <div key={category.name} className="border-b border-zinc-100 pb-6 last:border-0">
                  <button
                    onClick={() => toggleMobileCategory(category.name)}
                    className="w-full flex items-center justify-between text-xl font-medium text-zinc-900 cursor-pointer"
                  >
                    {category.name}
                    <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", expandedMobileCategory === category.name && "rotate-180")} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedMobileCategory === category.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 space-y-6 pl-4">
                          {category.sections.map((section) => (
                            <div key={section.title}>
                              <button
                                onClick={() => toggleMobileSection(section.title)}
                                className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-widest text-zinc-400 cursor-pointer"
                              >
                                {section.title}
                                <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expandedMobileSection === section.title && "rotate-180")} />
                              </button>
                              
                              <AnimatePresence>
                                {expandedMobileSection === section.title && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 grid grid-cols-2 gap-4 pl-2">
                                      {section.items.map((item) => (
                                        <Link
                                          key={item}
                                          to={`/category/${category.name.toLowerCase()}?sub=${section.title.toLowerCase()}&item=${item.toLowerCase()}`}
                                          className="text-sm text-zinc-600 cursor-pointer py-1"
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
                            className="block text-sm font-bold underline underline-offset-4 pt-2"
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
              
              <div className="pt-6 space-y-4">
                <Link to="/login" className="flex items-center gap-3 text-zinc-600" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">My Account</span>
                </Link>
                <div className="bg-zinc-50 rounded-2xl p-6">
                  <p className="text-sm font-bold uppercase tracking-widest mb-2">Need Help?</p>
                  <p className="text-sm text-zinc-500 mb-4">Our customer service team is available 24/7.</p>
                  <button className="text-sm font-bold underline underline-offset-4">Contact Us</button>
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

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

