import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Pagination } from '../../components/Pagination/Pagination';
import { PoweredBy } from '../../components/PoweredBy/PoweredBy';
import { FacetFilter } from '../../components/FacetFilter/FacetFilter';
import { useCart } from '../../context/CartContext';
import { motion } from 'motion/react';
import styles from './SearchResultsPage.module.css';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart } = useCart();
  const cartRef = useRef(cart);
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const itemsPerPage = 48;

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    
    // Convert selectedFilters object to API format
    const apiFilters = Object.entries(selectedFilters)
      .filter(([_, values]) => values.length > 0)
      .map(([field, values]) => ({
        field,
        values
      }));

    const apiSort = {
      field: sortBy.split('-')[0],
      order: sortBy.split('-')[1]
    }

    const response = await searchService.searchProducts({
      query, 
      filters: apiFilters,
      sortBy: apiSort, 
      cart: cartRef.current,
      numItems: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage
    });
    
    if (response && response.choices && response.choices.length > 0) {
      const data = response.choices[0].variations[0].payload.data;
      setResults(data.slots || []);
      setFacets(data.facets || []);
      setTotalResults(data.totalNumResults || 0);
    } else {
      setResults([]);
      setFacets([]);
      setTotalResults(0);
    }
    
    setLoading(false);
  }, [query, selectedFilters, sortBy, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Reset page when filters change
  useEffect(() => {
    if (searchParams.get('page')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('page');
      setSearchParams(newParams);
    }
  }, [query, selectedFilters, sortBy]);

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', page.toString());
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (column, value, isReplace = false) => {
    setSelectedFilters(prev => {
      if (isReplace) {
        return {
          ...prev,
          [column]: [value]
        };
      }

      const currentValues = prev[column] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [column]: newValues
      };
    });
  };

  const handleClearFacet = (column) => {
    setSelectedFilters(prev => {
      const newState = { ...prev };
      delete newState[column];
      return newState;
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSortBy('relevancy');
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchHeader}>
        <div>
          <h1 className={styles.searchTitle}>
            Search Results
          </h1>
          <p className={styles.searchSubtitle}>
            {loading ? 'Searching...' : `Found ${totalResults} results for "${query}"`}
          </p>
        </div>
        
        <div className={styles.searchControls}>
          <div className={styles.sortControl}>
            <span className={styles.sortLabel}>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="">Relevancy</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.searchLayout}>
        {/* Sidebar Facets */}
        <aside className={styles.searchSidebar}>
          {Object.values(selectedFilters).some(v => v.length > 0) && (
            <button 
              onClick={clearFilters}
              className={styles.sidebarClearAll}
            >
              Clear all filters
            </button>
          )}
          {facets.map((facet) => (
            <FacetFilter
              key={facet.column}
              facet={facet}
              selectedValues={selectedFilters[facet.column] || []}
              onFilterChange={handleFilterChange}
              onClearFacet={handleClearFacet}
            />
          ))}
        </aside>

        {/* Results Grid */}
        <div className={styles.searchResultsArea}>
          {loading ? (
            <div className={styles.loadingState}>Searching...</div>
          ) : results.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {results.map((product) => {
                  product = {...product, ...product.productData}
                  delete product.productData;
                  return (
                    <ProductCard key={product.sku || product.id} product={product} />
                  )
                })}
              </div>

              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <PoweredBy />
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>No products found matching your search.</p>
              <button 
                onClick={clearFilters}
                className={styles.emptyStateBtn}
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
