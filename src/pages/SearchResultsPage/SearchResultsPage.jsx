import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseFiltersFromParams, buildParamsWithFilters } from '../../helpers/filterUrlHelper';
import { searchService } from '../../services/searchService';
import { ListingPage } from '../../components/ListingPage/ListingPage';
import { useCart } from '../../context/CartContext';
import styles from './SearchResultsPage.module.css';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart } = useCart();
  const cartRef = useRef(cart);
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState([]);
  const [imageFilters, setImageFilters] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const selectedFilters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const sortBy = searchParams.get('sort') || '';
  const itemsPerPage = 48;

  const sortOptions = [
    { value: '', label: 'Relevancy' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' }
  ];

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
      const variation = response.choices[0].variations[0];
      const decisionId = response.choices[0].decisionId;
      const data = variation.payload.data;

      const processedResults = (data.slots || []).map(slot => ({
        ...slot,
        ...slot.productData,
        decisionId,
        variationId: variation.id
      }));

      setResults(processedResults);
      setFacets(data.facets || []);
      setImageFilters((data.imageFilters || []).filter(f => f.image && f.name));
      setTotalResults(data.totalNumResults || 0);
    } else {
      setResults([]);
      setFacets([]);
      setImageFilters([]);
      setTotalResults(0);
    }
    
    setLoading(false);
  }, [query, selectedFilters, sortBy, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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

  const handleApplyFilters = (newFilters) => {
    const newParams = buildParamsWithFilters(searchParams, newFilters, sortBy);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSetSortBy = (newSort) => {
    const newParams = buildParamsWithFilters(searchParams, selectedFilters, newSort);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className={styles.searchResultsContainer}>
      <ListingPage
        title="Search Results"
        subtitle={loading ? 'Searching...' : `Showing results for <q>${query}</q>`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: query ? `${query}` : 'Search' },
        ]}
        totalResults={totalResults}
        imageFilters={imageFilters}
        loading={loading}
        loadingText="Searching..."
        products={results}
        facets={facets}
        selectedFilters={selectedFilters}
        onApplyFilters={handleApplyFilters}
        onClearAllFilters={clearFilters}
        sortBy={sortBy}
        setSortBy={handleSetSortBy}
        sortOptions={sortOptions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        emptyStateText="No products found matching your search."
        resetButtonLabel="Reset all filters"
        showPoweredBy
      />
    </div>
  );
};
