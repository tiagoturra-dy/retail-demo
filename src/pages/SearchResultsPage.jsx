import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';

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
    <div id="search-results-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 id="search-results-title" className="text-4xl font-bold tracking-tight text-zinc-900">
            Search Results
          </h1>
          <p className="text-zinc-500 mt-2">
            {loading ? 'Searching...' : `Found ${results.length} results for "${query}"`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
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
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Facets */}
        <aside className="w-full lg:w-64 space-y-8">
          {availableSubcategories.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Refine by Category</h3>
              <div className="space-y-2">
                {availableSubcategories.map((sub) => (
                  <label key={sub} className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
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
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Price Range</h3>
            <div className="space-y-2">
              {[
                { label: 'Under $50', value: 'under-50' },
                { label: '$50 - $100', value: '50-100' },
                { label: '$100 - $500', value: '100-500' },
                { label: 'Over $500', value: 'over-500' },
              ].map((range) => (
                <label key={range.value} className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
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
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="text-center py-20">Searching...</div>
          ) : paginatedResults.length > 0 ? (
            <>
              <div id="search-results-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {paginatedResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-auto flex justify-center items-center gap-2 py-8 border-t border-zinc-100">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-10 h-10 rounded-full text-sm font-medium transition-colors cursor-pointer",
                          currentPage === page ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl">
              <p className="text-zinc-500">No products found matching your search.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-sm font-bold underline underline-offset-4 cursor-pointer"
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

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
