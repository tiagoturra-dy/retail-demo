import React, { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../ProductCard/ProductCard';
import { Pagination } from '../Pagination/Pagination';
import { PoweredBy } from '../PoweredBy/PoweredBy';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { FilterOverlay } from '../FilterOverlay/FilterOverlay';
import styles from './ListingPage.module.css';

const getSelectedCount = (filtersState) => {
  return Object.values(filtersState).reduce((count, values) => count + values.length, 0);
};

export const ListingPage = ({
  title,
  subtitle,
  totalResults,
  imageFilters,
  breadcrumbs,
  loading,
  loadingText,
  products,
  facets,
  selectedFilters,
  onApplyFilters,
  onClearAllFilters,
  sortBy,
  setSortBy,
  sortOptions,
  currentPage,
  totalPages,
  onPageChange,
  emptyStateText,
  resetButtonLabel,
  showPoweredBy = false,
}) => {
  return (
    <div className={styles.listingContainer}>
      {breadcrumbs?.length > 0 && (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className={styles.breadcrumbItem}>
              {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
              {crumb.href
                ? <Link to={crumb.href} className={styles.breadcrumbLink}>{crumb.label}</Link>
                : <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              }
            </span>
          ))}
        </nav>
      )}
      <div className={`${styles.listingHeader} ${imageFilters?.length > 0 ? styles.listingHeaderWithImages : ''}`}>
        <div>
          <h1 className={styles.listingTitle}>{title}</h1>
          {subtitle ? <p className={styles.listingSubtitle} dangerouslySetInnerHTML={{ __html: subtitle }}></p> : null}
        </div>
        {imageFilters?.length > 0 && (
          <div className={styles.imageFilters}>
            {imageFilters.map((filter) => (
              <Link key={filter.url} to={filter.url} className={styles.imageFilterItem}>
                <img src={filter.image} alt={filter.name} className={styles.imageFilterImg} />
                <span className={styles.imageFilterName}>{filter.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles.listingToolbar}>
        <FilterOverlay
          className={styles.facetsBox}
          facets={facets}
          selectedFilters={selectedFilters}
          onApplyFilters={onApplyFilters}
          onClearAllFilters={onClearAllFilters}
        />

        <div className={styles.sortBox}>
          <CustomSelect
            label="Sort"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            variant="bordered"
            icon={ArrowUpDown}
            className={styles.sortSelect}
          />
        </div>

        {totalResults > 0 && (
          <div className={styles.totalResults}>
            {totalResults} {totalResults === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>

      <div className={styles.resultsArea}>
        {loading ? (
          <div className={styles.loadingState}>{loadingText}</div>
        ) : products.length > 0 ? (
          <>
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.sku || product.id} product={product} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
            {showPoweredBy ? <PoweredBy /> : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>{emptyStateText}</p>
            <button
              type="button"
              onClick={onClearAllFilters}
              className={styles.emptyStateBtn}
            >
              {resetButtonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
