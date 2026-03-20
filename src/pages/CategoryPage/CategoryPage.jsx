import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { motion } from 'motion/react';
import './CategoryPage.css';

export const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get('sub');
  const item = searchParams.get('item');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceFilters, setPriceFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        catalogService.getProducts(categoryName, subcategory || undefined, priceFilters, item || undefined),
        catalogService.getCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
      setLoading(false);
      setCurrentPage(1);
    };
    fetchData();
  }, [categoryName, subcategory, priceFilters, item]);

  const categoryInfo = categories.find((c) => c.name.toLowerCase() === categoryName?.toLowerCase());

  const handlePriceFilterChange = (range) => {
    setPriceFilters(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const clearFilters = () => {
    setPriceFilters([]);
    navigate(`/category/${categoryName}`);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="category-page-container">
      <div className="category-header">
        <div>
          <h1 className="category-title">
            {categoryName === 'all' ? 'All Collections' : categoryName}
          </h1>
          {subcategory && (
            <p className="category-subtitle">
              Showing results for <span className="category-subtitle-highlight">{subcategory}</span>
            </p>
          )}
        </div>
        {(priceFilters.length > 0 || subcategory) && (
          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="category-layout">
        {/* Sidebar Filters */}
        <aside className="category-sidebar">
          <div>
            <h3 className="sidebar-title">Categories</h3>
            <div className="sidebar-section-list">
              {categoryInfo?.sections.map((section) => (
                <div key={section.title}>
                  <h4 className="sidebar-subtitle">{section.title}</h4>
                  <ul className="sidebar-item-list">
                    {section.items.map((itemStr) => {
                      const isActive = searchParams.get('item')?.toLowerCase() === itemStr.toLowerCase();
                      return (
                        <li key={itemStr}>
                          <Link
                            to={`/category/${categoryName}?sub=${section.title.toLowerCase()}&item=${itemStr.toLowerCase()}`}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                          >
                            {itemStr}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="sidebar-title">Price Range</h3>
            <div className="price-filter-list">
              {[
                { label: 'Under $50', value: 'under-50' },
                { label: '$50 - $100', value: '50-100' },
                { label: '$100 - $500', value: '100-500' },
                { label: 'Over $500', value: 'over-500' },
              ].map((range) => (
                <label key={range.value} className="price-filter-label">
                  <input 
                    type="checkbox" 
                    className="price-filter-checkbox"
                    checked={priceFilters.includes(range.value)}
                    onChange={() => handlePriceFilterChange(range.value)}
                  /> 
                  {range.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="category-product-area">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="product-grid">
                {paginatedProducts.map((product) => (
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
              <p className="empty-state-text">No products found in this category.</p>
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
