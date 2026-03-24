import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { searchService } from '../../services/searchService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Pagination } from '../../components/Pagination/Pagination';
import { FacetFilter } from '../../components/FacetFilter/FacetFilter';
import { CategoryBanner } from '../../components/CategoryBanner/CategoryBanner';
import { useCart } from '../../context/CartContext';
import { CATEGORIES } from '../../helpers/categoryConstants';
import styles from './CategoryPage.module.css';

export const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const subcategory = searchParams.get('sub');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const { cart } = useCart();
  const cartRef = useRef(cart);
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const itemsPerPage = 48;

  const categoryConfig = CATEGORIES.find(c => c.name === categoryName);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Convert selectedFilters object to API format
    const apiFilters = Object.entries(selectedFilters)
      .filter(([_, values]) => values.length > 0)
      .map(([field, values]) => ({
        field,
        values
      }));

    // Add category filter if not "all"
    if (categoryName && categoryName !== 'all') {
      const catFilter = apiFilters.find(f => f.field === 'categories');
      if (catFilter) {
        if (!catFilter.values.includes(categoryName)) {
          catFilter.values.push(categoryName);
        }
      } else {
        apiFilters.push({ field: 'categories', values: [categoryName] });
      }
    }

    const apiSort = {
      field: sortBy.split('-')[0],
      order: sortBy.split('-')[1]
    };

    const [response, catData] = await Promise.all([
      searchService.searchProducts({
        type: 'category',
        query: '',
        filters: apiFilters,
        sortBy: apiSort,
        cart: cartRef.current,
        numItems: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      }),
      catalogService.getCategories()
    ]);

    console.log('Category response', response)
    
    if (response && response.choices && response.choices.length > 0) {
      const data = response.choices[0].variations[0].payload.data;
      setProducts(data.slots || []);
      setFacets(data.facets || []);
      setTotalResults(data.totalNumResults || 0);
    } else {
      setProducts([]);
      setFacets([]);
      setTotalResults(0);
    }
    
    setCategories(catData);
    setLoading(false);
  }, [categoryName, selectedFilters, sortBy, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    if (searchParams.get('page')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('page');
      setSearchParams(newParams);
    }
  }, [categoryName, selectedFilters, sortBy]);

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
    setSortBy('');
    navigate(`/category/${categoryName}`);
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className={styles.categoryPageContainer}>
      {categoryConfig?.banner && (
        <CategoryBanner bannerConfig={categoryConfig.banner} />
      )}
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

      <div className={styles.categoryLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.categorySidebar}>
          {Object.values(selectedFilters).some(v => v.length > 0) && (
            <button 
              onClick={clearFilters}
              className={styles.sidebarClearAll}
            >
              Clear all filters
            </button>
          )}
          {facets.filter(f => f.column !== 'categories').map((facet) => (
            <FacetFilter
              key={facet.column}
              facet={facet}
              selectedValues={selectedFilters[facet.column] || []}
              onFilterChange={handleFilterChange}
              onClearFacet={handleClearFacet}
            />
          ))}
        </aside>

        {/* Product Grid */}
        <div className={styles.categoryProductArea}>
          {loading ? (
            <div className={styles.loadingState}>Loading products...</div>
          ) : products.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {products.map((product) => {
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
