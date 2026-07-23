import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { searchService } from '../../services/searchService';
import styles from './SearchOverlay.module.css';
import { ArrowUpRight, History, Search, X } from 'lucide-react'
import { Helper } from '../../helpers/helper';
import { PoweredBy } from '../PoweredBy/PoweredBy';
import { CameraIcon } from '../../icons/CameraIcon/CameraIcon';
import { personalizationService } from '../../services/personalizationService';
import { ProductCard } from '../ProductCard/ProductCard';
import { MicButton } from '../MicButton/MicButton';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../../helpers/currencyConstants';
import { isMuseQuery } from '../../helpers/aiTriggerConstants';
import { LiveMicButton } from '../LiveMicButton/LiveMicButton';
import { useMuse } from '../../context/MuseContext';
import { MuseStripBanner } from '../MuseStripBanner/MuseStripBanner';

const constants = {
  searchPlaceholder: 'Type to search...',
  voiceTooltip: 'Voice language: English only',
  topSearchesTitle: 'Top Searches',
  recentSearchesTitle: 'Recent Searches',
  noSuggestionsText: "Couldn't find any suggestions...",
  askAssistantTitle: 'Ask Our Stylist',
  searchResultsTitle: 'Search Results',
  recommendedTitle: 'Recommended For You',
  museEmptyText: 'Our stylist will help you find',
  noResultsText: 'No results found for',
  loadingRecsText: 'Loading recommendations...',
  viewAllText: 'View all results',
  museSearchFallbackText: 'Try our Experience Search instead',
};

export const SearchOverlay = ({ isOpen, onClose, initialQuery = '', embedded = false, onOpen }) => {
  const navigate = useNavigate();
  const { openMuse } = useMuse();
  const { lang } = useCurrency();
  const langLabel = CURRENCY_OPTIONS.find(o => o.lang === lang)?.langLabel ?? lang;
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const [navBottom, setNavBottom] = useState('5rem');

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

    // Fetch recommendations for empty state
    const fetchRecommendations = async () => {
      try {
        const recs = await personalizationService.getRecommendations({
          selectors: ['SearchOverlayRecs']
        });
        console.log('Recommendations response:', recs);
        
        if (recs?.choices) {
          const recProducts = recs.choices.flatMap(choice =>
            choice.variations.flatMap(variation =>
              (variation.payload.data.slots || []).map(slot => ({
                ...slot,
                ...slot.productData,
                decisionId: choice.decisionId,
                variationId: variation.id
              }))
            )
          ).filter(product => product.sku);
          console.log('Processed recommendations:', recProducts);
          setRecommendations(recProducts);
        } else {
          console.warn('No recommendations found');
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const nav = document.querySelector('.dy-nav');
      if (nav) {
        const rect = nav.getBoundingClientRect();
        setNavBottom(`${rect.bottom}px`);
      }
      if (initialQuery) setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      if (!embedded) setQuery('');
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, initialQuery, embedded]);

  useEffect(() => {
    if (embedded && !isOpen) setQuery(initialQuery);
  }, [embedded, initialQuery, isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (query.length >= 3) {
        try {
          const isMuse = isMuseQuery(query);
          if (isMuse) {
            setSuggestions(initialSuggestions);
            setResults([]);
            return;
          }

          const [terms, products] = await Promise.all([
            searchService.getTermsSuggestions({text: query, numItems: 5}),
            searchService.searchProducts({query, numItems: 4})
          ]);

          if (products && products.choices && products.choices.length > 0) {
            const variation = products.choices[0].variations[0];
            const decisionId = products.choices[0].decisionId;
            const data = variation.payload.data;

            const processedResults = (data.slots || []).map(slot => ({
              ...slot,
              ...slot.productData,
              decisionId,
              variationId: variation.id
            }));
            setResults(processedResults);
          } else {
            setResults([]);
          }
            
          setSuggestions(terms || []);
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

  useEffect(() => {
    if (isOpen && window.DYO) {
      // Small delay to ensure the DOM element is rendered
      const timer = setTimeout(() => {
        window.DYO.smartObject("Image Search", {
          target: "dy_Image_Search",
          inline: true
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      if (isMuseQuery(query)) {
        openMuse({ query: query.trim() });
        onClose();
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    saveSearch(term);
    if (isMuseQuery(term)) {
      openMuse({ query: term });
      onClose();
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
      onClose();
    }
  };

  const handleTrackClick = (product) => {
    console.log('ProductCard clicked:', product.name, 'DecisionId:', product.decisionId);
    if (product.decisionId) {
      personalizationService.trackClick({ decisionId: product.decisionId, variationId: product.variationId });
    } else {
      console.warn('No decisionId found for product:', product.name);
    }
    navigate(`/product/${product.sku}`);
    onClose();
  };

  const displaySuggestions = query.length >= 3 ? suggestions : initialSuggestions;
  const isMuse = query.length >= 3 && isMuseQuery(query);

  return (
    <>
      {embedded && !isOpen && (
        <div className={styles.embeddedWrapper}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchInputIcon} />
            <form onSubmit={(e) => { e.preventDefault(); onOpen?.(); }} className={styles.searchForm}>
              <input
                type="text"
                value={query}
                readOnly
                onFocus={() => onOpen?.()}
                placeholder={constants.searchPlaceholder}
                className={styles.searchInput}
              />
              <span className={styles.searchInputLine} />
            </form>
            <MicButton
              onTranscript={(t) => { setQuery(t); onOpen?.(); }}
              lang="en-US"
              tooltip={constants.voiceTooltip}
              className={styles.mic}
            />
            <LiveMicButton
              lang={lang}
              tooltip={`Live conversation (${langLabel})`}
              onNavigate={onClose}
              className={styles.liveMic}
            />
          </div>
        </div>
      )}
      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.searchOverlay}
          style={{ '--nav-bottom': navBottom }}
        >
          {/* Main Search Canvas */}
          <main className={styles.searchMain}>
            <div className={styles.searchContainer}>
              {/* Search Input Section */}
              <div className={styles.searchInputWrapper}>
                <Search className={styles.searchInputIcon} />
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={constants.searchPlaceholder}
                    className={styles.searchInput}
                  />
                </form>
                <div id="dy_Image_Search" className={styles.imageSearchBtn} aria-label="Search by image"></div>
                <MicButton
                  onTranscript={(t) => setQuery(prev => prev ? `${prev} ${t}` : t)}
                  lang="en-US"
                  tooltip={constants.voiceTooltip}
                  className={styles.mic}
                />
                <LiveMicButton
                  lang={lang}
                  tooltip={`Live conversation (${langLabel})`}
                  onNavigate={onClose}
                  className={styles.liveMic}
                />
                <button onClick={onClose} className={styles.searchCloseBtn} aria-label="Close search">
                  <X className={styles.searchCloseIcon} />
                </button>
              </div>

              {/* Content Grid */}
              <div className={styles.searchGrid}>
                {/* Suggestions Column */}
                <div className={styles.searchSuggestionsCol}>
                  <section>
                    <h3 className={styles.searchSectionTitle}>{constants.topSearchesTitle}</h3>
                    <div className={styles.searchTags}>
                      {displaySuggestions.length > 0 ? displaySuggestions.map((suggestion) => (
                        <button
                          key={suggestion.term}
                          onClick={() => handleSuggestionClick(suggestion.term)}
                          className={styles.searchTag}
                        >
                          {suggestion.term}
                        </button>
                      )) : 
                      (
                        <div className={styles.suggestionsEmpty}>{constants.noSuggestionsText}</div>
                      )}
                    </div>
                  </section>

                  {recentSearches.length > 0 && query.length < 3 && (
                    <section className={styles.recentSearchesSection}>
                      <h3 className={styles.searchSectionTitle}>{constants.recentSearchesTitle}</h3>
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

                  <section className={styles.searchImageSearchSection}>
                    <MuseStripBanner query={query} />
                  </section>
                </div>

                {/* Suggestion / Results Preview Column */}
                <div className={styles.searchResultsCol}>
                  <h3 className={styles.searchSectionTitle}>
                    {isMuse ? constants.askAssistantTitle : query.length >= 3 ? constants.searchResultsTitle : constants.recommendedTitle}
                  </h3>
                  <div className={styles.searchResultsList}>
                    {results.length > 0 ? (
                      results.map((product) => {
                        product = {...product, ...product.productData}
                        delete product.productData;
                        return (
                          <ProductCard key={product.sku} product={product} compact className={styles.searchResultItem} onClick={() => handleTrackClick(product)} />
                        );
                      })
                    ) : query.length >= 3 ? (
                      isMuse
                        ? <div className={styles.searchEmpty}><span>{constants.museEmptyText} <q>{query}</q><button className={styles.searchFallbackLink} onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}>{constants.museSearchFallbackText}</button></span></div>
                        : <div className={styles.searchEmpty}><span>{constants.noResultsText} <q>{query}</q></span></div>
                    ) : recommendations.length > 0 ? (
                      recommendations.map((product) => {
                        product = {...product, ...product.productData}
                        delete product.productData;
                        return (
                          <ProductCard key={product.sku} product={product} compact className={styles.searchResultItem} onClick={() => handleTrackClick(product)} />
                        );
                      })
                    ) : (
                      <div className={styles.searchEmpty}>{constants.loadingRecsText}</div>
                    )}
                  </div>

                  {(results.length > 0 || (query.length < 3 && recommendations.length > 0)) && (
                    <div className={styles.searchViewAllContainer}>
                      <PoweredBy />
                      <button onClick={handleSearch} className={styles.searchViewAllBtn}>
                        {constants.viewAllText}
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
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};
