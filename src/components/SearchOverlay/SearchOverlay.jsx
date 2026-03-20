import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { searchService } from '../../services/searchService';
import styles from './SearchOverlay.module.css';

export const SearchOverlay = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

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

    const handleEsc = (e) => {
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

  const saveSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleSuggestionClick = (term) => {
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
          className={styles.searchOverlay}
        >
          {/* Header */}
          <header className={styles.searchHeader}>
            <div className={styles.searchHeaderInner}>
              <div className={styles.searchLogo}>LUXE</div>
              <button onClick={onClose} className={styles.searchCloseBtn}>
                <span className={styles.searchCloseText}>Close</span>
                <span className={`material-symbols-outlined ${styles.searchCloseIcon}`}>close</span>
              </button>
            </div>
          </header>

          {/* Main Search Canvas */}
          <main className={styles.searchMain}>
            <div className={styles.searchContainer}>
              {/* Search Input Section */}
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputWrapper}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products, categories..."
                    className={styles.searchInput}
                  />
                  <button type="button" className={styles.imageSearchBtn} aria-label="Search by image">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                </div>
                <div className={styles.searchInputLine}></div>
              </form>

              {/* Content Grid */}
              <div className={styles.searchGrid}>
                {/* Suggestions Column */}
                <div className={styles.searchSuggestionsCol}>
                  <section>
                    <h3 className={styles.searchSectionTitle}>Our Suggestions</h3>
                    <div className={styles.searchTags}>
                      {popularSuggestions.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSuggestionClick(sub)}
                          className={styles.searchTag}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </section>

                  {recentSearches.length > 0 && query.length <= 1 && (
                    <section className={styles.recentSearchesSection}>
                      <h3 className={styles.searchSectionTitle}>Recent Searches</h3>
                      <div className={styles.recentSearchesList}>
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(term)}
                            className={styles.recentSearchItem}
                          >
                            <span className={`material-symbols-outlined ${styles.recentSearchIcon}`}>history</span>
                            {term}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Autocomplete / Results Preview Column */}
                <div className={styles.searchResultsCol}>
                  <h3 className={styles.searchSectionTitle}>
                    {query.length > 1 ? 'Refining Search' : 'Featured Products'}
                  </h3>
                  <div className={styles.searchResultsList}>
                    {results.length > 0 ? (
                      results.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            onClose();
                          }}
                          className={styles.searchResultItem}
                        >
                          <div className={styles.searchResultInfo}>
                            <div className={styles.searchResultImageContainer}>
                              <img src={product.image} alt={product.name} className={styles.searchResultImage} />
                            </div>
                            <div>
                              <div className={styles.searchResultNameContainer}>
                                <span className={styles.searchResultName}>
                                  {product.name.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                                    part.toLowerCase() === query.toLowerCase() ? 
                                    <span key={i} className={styles.searchHighlight}>{part}</span> : 
                                    part
                                  )}
                                </span>
                              </div>
                              <span className={styles.searchResultCategory}>{product.category} • {product.subcategory}</span>
                            </div>
                          </div>
                          <span className={`material-symbols-outlined ${styles.searchResultArrow}`}>north_west</span>
                        </div>
                      ))
                    ) : query.length > 1 ? (
                      <div className={styles.searchEmpty}>No results found for "{query}"</div>
                    ) : (
                      <div className={styles.searchEmpty}>Start typing to see results...</div>
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className={styles.searchViewAllContainer}>
                      <button onClick={handleSearch} className={styles.searchViewAllBtn}>
                        View all results
                        <span className={`material-symbols-outlined ${styles.viewAllIcon}`}>trending_flat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className={styles.searchFooter}>
            <div className={styles.searchFooterInner}>
              <span>Press <kbd className={styles.searchKbd}>ESC</kbd> to exit search</span>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
