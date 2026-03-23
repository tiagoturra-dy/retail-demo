import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Pagination } from '../../components/Pagination/Pagination';
import { motion } from 'motion/react';
import styles from './SearchResultsPage.module.css';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subFilters, setSubFilters] = useState([]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [sortBy, setSortBy] = useState('relevancy');
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const response = await searchService.searchProducts(query, subFilters, priceFilters, sortBy);
      
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
    };
    fetchResults();
  }, [query, subFilters, priceFilters, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    if (searchParams.get('page')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('page');
      setSearchParams(newParams);
    }
  }, [query, subFilters, priceFilters, sortBy]);

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

  const categoryFacet = facets.find(f => f.column === 'categories');
  const availableSubcategories = categoryFacet ? categoryFacet.values.map(v => v.name) : [];

  const handleSubFilterChange = (sub) => {
    setSubFilters(prev => 
      prev.includes(sub.toLowerCase()) ? prev.filter(s => s !== sub.toLowerCase()) : [...prev, sub.toLowerCase()]
    );
  };

  const handlePriceFilterChange = (range) => {
    setPriceFilters(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const clearFilters = () => {
    setSubFilters([]);
    setPriceFilters([]);
    setSortBy('relevancy');
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              <option value="relevancy">Relevancy</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
          {(subFilters.length > 0 || priceFilters.length > 0) && (
            <button 
              onClick={clearFilters}
              className={styles.clearFiltersBtn}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className={styles.searchLayout}>
        {/* Sidebar Facets */}
        <aside className={styles.searchSidebar}>
          {availableSubcategories.length > 0 && (
            <div>
              <h3 className={styles.sidebarTitle}>Refine by Category</h3>
              <div className={styles.filterList}>
                {availableSubcategories.map((sub) => (
                  <label key={sub} className={styles.filterLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.filterCheckbox}
                      checked={subFilters.includes(sub.toLowerCase())}
                      onChange={() => handleSubFilterChange(sub)}
                    /> 
                    {sub}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className={styles.sidebarTitle}>Price Range</h3>
            <div className={styles.filterList}>
              {[
                { label: 'Under $50', value: 'under-50' },
                { label: '$50 - $100', value: '50-100' },
                { label: '$100 - $500', value: '100-500' },
                { label: 'Over $500', value: 'over-500' },
              ].map((range) => (
                <label key={range.value} className={styles.filterLabel}>
                  <input 
                    type="checkbox" 
                    className={styles.filterCheckbox}
                    checked={priceFilters.includes(range.value)}
                    onChange={() => handlePriceFilterChange(range.value)}
                  /> 
                  {range.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className={styles.searchResultsArea}>
          {loading ? (
            <div className={styles.loadingState}>Searching...</div>
          ) : paginatedResults.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {paginatedResults.map((product) => (
                  <ProductCard key={product.sku || product.id} product={product} />
                ))}
              </div>

              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
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
