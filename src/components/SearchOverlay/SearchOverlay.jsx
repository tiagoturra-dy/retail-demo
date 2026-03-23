import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { searchService } from '../../services/searchService';
import styles from './SearchOverlay.module.css';
import { ArrowUpRight, History } from 'lucide-react'
import { Helper } from '../../helpers/helper';
import { PoweredBy } from '../PoweredBy/PoweredBy';
import { CameraIcon } from '../../icons/CameraIcon/CameraIcon';

export const SearchOverlay = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Fetch initial suggestions once
    const fetchInitialSuggestions = async () => {
      try {
        const terms = await searchService.getTermsSuggestions({text: '', numItems: 5});
        setInitialSuggestions(terms || []);
      } catch (error) {
        console.error('Error fetching initial suggestions:', error);
      }
    };
    fetchInitialSuggestions();
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
      if (query.length >= 3) {
        try {
          const [terms, products] = await Promise.all([
            searchService.getTermsSuggestions({text: query, numItems: 5}),
            searchService.searchProducts({query, numItems: 4})
          ]);
          setSuggestions(terms || []);
          setResults(products?.choices?.[0]?.variations?.[0]?.payload?.data?.slots || []);
        } catch (error) {
          console.error('Error fetching search data:', error);
          setSuggestions([]);
          setResults([]);
        }
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

  const displaySuggestions = query.length >= 3 ? suggestions : initialSuggestions;

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
                <span className={`material-symbols-outlined ${styles.searchCloseIcon}`}>x</span>
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
                    <CameraIcon />
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
                      {displaySuggestions.length > 0 ? displaySuggestions.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSuggestionClick(sub)}
                          className={styles.searchTag}
                        >
                          {sub}
                        </button>
                      )) : 
                      (
                        <div className={styles.suggestionsEmpty}>Couldn't find any suggestions...</div>
                      )}
                    </div>
                  </section>

                  {recentSearches.length > 0 && query.length < 3 && (
                    <section className={styles.recentSearchesSection}>
                      <h3 className={styles.searchSectionTitle}>Recent Searches</h3>
                      <div className={styles.recentSearchesList}>
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(term)}
                            className={styles.recentSearchItem}
                          >
                            <span className={`material-symbols-outlined ${styles.recentSearchIcon}`}>
                              <History size={16} />
                            </span>
                            {term}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Suggestion / Results Preview Column */}
                <div className={styles.searchResultsCol}>
                  <h3 className={styles.searchSectionTitle}>
                    {query.length >= 3 ? 'Refining Search' : 'Featured Products'}
                  </h3>
                  <div className={styles.searchResultsList}>
                    {results.length > 0 ? (
                      results.map((product) => {
                        product = {...product, ...product.productData}
                        delete product.productData;
                        return (
                        <div
                          key={product.sku}
                          onClick={() => {
                            navigate(`/product/${product.sku}`);
                            onClose();
                          }}
                          className={styles.searchResultItem}
                        >
                          <div className={styles.searchResultInfo}>
                            <div className={styles.searchResultImageContainer}>
                              <img src={Helper.getProductImage(product.image_url)} alt={product.name} className={styles.searchResultImage} />
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
                              <span className={styles.searchResultCategory}>{Helper.getProducCategoriesDisplay(product.categories)}</span>
                            </div>
                          </div>
                          <span className={`material-symbols-outlined ${styles.searchResultArrow}`}>
                            <ArrowUpRight />
                          </span>
                        </div>
                      )})
                    ) : query.length >= 3 ? (
                      <div className={styles.searchEmpty}>No results found for "{query}"</div>
                    ) : (
                      <div className={styles.searchEmpty}>Start typing to see results...</div>
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className={styles.searchViewAllContainer}>
                      <PoweredBy />
                      <button onClick={handleSearch} className={styles.searchViewAllBtn}>
                        View all results
                        <span className={`material-symbols-outlined ${styles.viewAllIcon}`}>
                          <ArrowUpRight />
                        </span>
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
