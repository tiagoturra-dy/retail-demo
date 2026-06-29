import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { searchService } from '../../services/searchService';
import { CategoryBanner } from '../../components/CategoryBanner/CategoryBanner';
import { ListingPage } from '../../components/ListingPage/ListingPage';
import { useCart } from '../../context/CartContext';
import { CATEGORIES } from '../../helpers/categoryConstants';
import styles from './CategoryPage.module.css';

export const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const subcategory = searchParams.get('sub');
  const item = searchParams.get('item');
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
  const [imageFilters, setImageFilters] = useState([]);
  const itemsPerPage = 48;

  const sortOptions = [
    { value: '', label: 'Relevancy' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' }
  ];

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

    // Add category filter using the lowest level available: item > sub > categoryName
    const effectiveCategory = item || subcategory || categoryName;
    if (effectiveCategory && effectiveCategory !== 'all') {
      const catFilter = apiFilters.find(f => f.field === 'categories');
      if (catFilter) {
        if (!catFilter.values.includes(effectiveCategory)) {
          catFilter.values.push(effectiveCategory);
        }
      } else {
        apiFilters.push({ field: 'categories', values: [effectiveCategory] });
      }
    }

    const apiSort = {
      field: sortBy.split('-')[0],
      order: sortBy.split('-')[1]
    };

    const [response, catData] = await Promise.all([
      searchService.browseProducts({
        type: 'category',
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
      const variation = response.choices[0].variations[0];
      const decisionId = response.choices[0].decisionId;
      const data = variation.payload.data;

      const processedProducts = (data.slots || []).map(slot => ({
        ...slot,
        ...slot.productData,
        decisionId,
        variationId: variation.id
      }));

      setProducts(processedProducts);
      setFacets(data.facets || []);
      setTotalResults(data.totalNumResults || 0);
      setImageFilters((data.custom?.imageFilters || []).filter(f => f.image && f.name));
    } else {
      setProducts([]);
      setFacets([]);
      setTotalResults(0);
    }
    
    setCategories(catData);
    setLoading(false);
  }, [categoryName, subcategory, item, selectedFilters, sortBy, currentPage]);

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

  const clearFilters = () => {
    setSelectedFilters({});
    setSortBy('');
    navigate(`/category/${categoryName}`);
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const categoryFacets = facets.filter((facet) => facet.column !== 'categories');
  const activeCategoryLabel = item || subcategory || categoryName;

  return (
    <div className={styles.categoryPageContainer}>
      {categoryConfig?.banner && (
        <CategoryBanner bannerConfig={categoryConfig.banner} />
      )}
      <ListingPage
        title={categoryName === 'all' ? 'All Collections' : subcategory || categoryName}
        subtitle={subcategory ? `Showing results for ${activeCategoryLabel}` : ''}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          ...(categoryName === 'all'
            ? [{ label: 'All Collections' }]
            : [
                { label: categoryName, href: subcategory ? `/category/${categoryName}` : undefined },
                ...(subcategory ? [{ label: subcategory }] : []),
              ]
          ),
        ]}
        loading={loading}
        loadingText="Loading products..."
        products={products}
        facets={categoryFacets}
        selectedFilters={selectedFilters}
        onApplyFilters={setSelectedFilters}
        onClearAllFilters={clearFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={sortOptions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        emptyStateText="No products found in this category."
        resetButtonLabel="Reset all filters"
        imageFilters={imageFilters}
        totalResults={totalResults}
      />
    </div>
  );
};
