import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { motion } from 'motion/react';
import styles from './CategoryPage.module.css';

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
    <div className={styles.categoryPageContainer}>
      <div className={styles.categoryHeader}>
        <div>
          <h1 className={styles.categoryTitle}>
            {categoryName === 'all' ? 'All Collections' : categoryName}
          </h1>
          {subcategory && (
            <p className={styles.categorySubtitle}>
              Showing results for <span className={styles.categorySubtitleHighlight}>{subcategory}</span>
            </p>
          )}
        </div>
        {(priceFilters.length > 0 || subcategory) && (
          <button 
            onClick={clearFilters}
            className={styles.clearFiltersBtn}
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className={styles.categoryLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.categorySidebar}>
          <div>
            <h3 className={styles.sidebarTitle}>Categories</h3>
            <div className={styles.sidebarSectionList}>
              {categoryInfo?.sections.map((section) => (
                <div key={section.title}>
                  <h4 className={styles.sidebarSubtitle}>{section.title}</h4>
                  <ul className={styles.sidebarItemList}>
                    {section.items.map((itemStr) => {
                      const isActive = searchParams.get('item')?.toLowerCase() === itemStr.toLowerCase();
                      return (
                        <li key={itemStr}>
                          <Link
                            to={`/category/${categoryName}?sub=${section.title.toLowerCase()}&item=${itemStr.toLowerCase()}`}
                            className={`${styles.sidebarLink} ${isActive ? styles.active : ''}`}
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
            <h3 className={styles.sidebarTitle}>Price Range</h3>
            <div className={styles.priceFilterList}>
              {[
                { label: 'Under $50', value: 'under-50' },
                { label: '$50 - $100', value: '50-100' },
                { label: '$100 - $500', value: '100-500' },
                { label: 'Over $500', value: 'over-500' },
              ].map((range) => (
                <label key={range.value} className={styles.priceFilterLabel}>
                  <input 
                    type="checkbox" 
                    className={styles.priceFilterCheckbox}
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
        <div className={styles.categoryProductArea}>
          {loading ? (
            <div className={styles.loadingState}>Loading products...</div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={styles.paginationArrow}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <div className={styles.paginationNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={styles.paginationArrow}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>No products found in this category.</p>
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
