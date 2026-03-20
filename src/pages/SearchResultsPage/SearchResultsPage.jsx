import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { motion } from 'motion/react';
import './SearchResultsPage.css';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subFilters, setSubFilters] = useState([]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [sortBy, setSortBy] = useState('relevancy');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const data = await searchService.searchProducts(query, subFilters, priceFilters, sortBy);
      setResults(data);
      setLoading(false);
      setCurrentPage(1);
    };
    fetchResults();
  }, [query, subFilters, priceFilters, sortBy]);

  const availableSubcategories = Array.from(new Set(results.map(p => p.subcategory)));

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

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="search-results-container">
      <div className="search-header">
        <div>
          <h1 className="search-title">
            Search Results
          </h1>
          <p className="search-subtitle">
            {loading ? 'Searching...' : `Found ${results.length} results for "${query}"`}
          </p>
        </div>
        
        <div className="search-controls">
          <div className="sort-control">
            <span className="sort-label">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
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
              className="clear-filters-btn"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="search-layout">
        {/* Sidebar Facets */}
        <aside className="search-sidebar">
          {availableSubcategories.length > 0 && (
            <div>
              <h3 className="sidebar-title">Refine by Category</h3>
              <div className="filter-list">
                {availableSubcategories.map((sub) => (
                  <label key={sub} className="filter-label">
                    <input 
                      type="checkbox" 
                      className="filter-checkbox"
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
            <h3 className="sidebar-title">Price Range</h3>
            <div className="filter-list">
              {[
                { label: 'Under $50', value: 'under-50' },
                { label: '$50 - $100', value: '50-100' },
                { label: '$100 - $500', value: '100-500' },
                { label: 'Over $500', value: 'over-500' },
              ].map((range) => (
                <label key={range.value} className="filter-label">
                  <input 
                    type="checkbox" 
                    className="filter-checkbox"
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
        <div className="search-results-area">
          {loading ? (
            <div className="loading-state">Searching...</div>
          ) : paginatedResults.length > 0 ? (
            <>
              <div className="product-grid">
                {paginatedResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-arrow"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-arrow"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">No products found matching your search.</p>
              <button 
                onClick={clearFilters}
                className="empty-state-btn"
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
