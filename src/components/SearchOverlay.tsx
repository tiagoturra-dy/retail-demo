import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { searchService } from '../services/searchService';
import { Product } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSuggestions = ['clothing', 'watch', 'men', 'women'];

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchData = async () => {
      if (query.length > 1) {
        const [terms, products] = await Promise.all([
          searchService.getAutocompleteTerms(query),
          searchService.searchProducts(query)
        ]);
        setSuggestions(terms);
        setResults(products.slice(0, 4));
      } else {
        setSuggestions([]);
        setResults([]);
      }
    };
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    saveSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden font-body text-black"
        >
          {/* Header */}
          <header className="h-24 border-b border-zinc-100 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center justify-between">
              <div className="text-2xl font-black tracking-tighter text-black">
                LUXE
              </div>
              <button 
                onClick={onClose}
                className="group flex items-center gap-2 p-2 rounded-full hover:bg-zinc-50 transition-all duration-300 cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                <span className="material-symbols-outlined text-3xl text-black">close</span>
              </button>
            </div>
          </header>

          {/* Main Search Canvas */}
          <main className="flex-grow overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
              {/* Search Input Section */}
              <form onSubmit={handleSearch} className="relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products, categories..."
                    className="w-full bg-transparent border-none text-4xl md:text-6xl font-headline font-light tracking-tight text-black focus:ring-0 placeholder:text-zinc-200 transition-all duration-500 p-0"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-100 group-focus-within:h-[2px] group-focus-within:bg-black transition-all duration-500"></div>
                </form>

                {/* Content Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-16">
                {/* Suggestions Column */}
                <div className="md:col-span-4 space-y-12">
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-zinc-400 mb-8">Our Suggestions</h3>
                    <div className="flex flex-wrap gap-3">
                      {popularSuggestions.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSuggestionClick(sub)}
                          className="px-6 py-2.5 bg-zinc-50 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </section>

                  {recentSearches.length > 0 && query.length <= 1 && (
                    <section>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-zinc-400 mb-6">Recent Searches</h3>
                      <div className="space-y-3">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(term)}
                            className="flex items-center gap-3 text-sm text-zinc-500 hover:text-black transition-colors group cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg text-zinc-300 group-hover:text-black">history</span>
                            {term}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Autocomplete / Results Preview Column */}
                <div className="md:col-span-8">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-zinc-400 mb-8">
                    {query.length > 1 ? 'Refining Search' : 'Featured Products'}
                  </h3>
                  <div className="space-y-2">
                    {results.length > 0 ? (
                      results.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            onClose();
                          }}
                          className="group flex items-center justify-between p-4 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-black">
                                  {product.name.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                                    part.toLowerCase() === query.toLowerCase() ? 
                                    <span key={i} className="text-zinc-400 font-bold">{part}</span> : 
                                    part
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-400">{product.category} • {product.subcategory}</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">north_west</span>
                        </div>
                      ))
                    ) : query.length > 1 ? (
                      <div className="p-6 text-zinc-400 italic">No results found for "{query}"</div>
                    ) : (
                      <div className="p-6 text-zinc-400 italic">Start typing to see results...</div>
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={handleSearch}
                        className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-headline font-bold tracking-widest uppercase text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/10 cursor-pointer"
                      >
                        View all results
                        <span className="material-symbols-outlined text-sm">trending_flat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="h-16 border-t border-zinc-100 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center text-zinc-400 text-[10px] uppercase tracking-[0.4em]">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-50 font-mono">ESC</kbd> to exit search</span>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
