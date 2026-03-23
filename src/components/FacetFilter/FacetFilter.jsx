import React, { useState, useMemo } from 'react';
import styles from './FacetFilter.module.css';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PriceRangeFilter } from '../PriceRangeFilter/PriceRangeFilter';

export const FacetFilter = ({ facet, selectedValues, onFilterChange, onClearFacet }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredValues = useMemo(() => {
    if (facet.valuesType === 'number') return [];
    if (!searchTerm) return facet.values;
    return facet.values.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [facet.values, searchTerm, facet.valuesType]);

  const displayedValues = isExpanded ? filteredValues : filteredValues.slice(0, 10);
  const hasMore = filteredValues.length > 10;
  const showSearch = facet.valuesType !== 'number' && facet.values.length > 15;
  const hasSelections = selectedValues.length > 0;

  const handlePriceChange = (range) => {
    // For price, we'll store it as a single object in the array
    onFilterChange(facet.column, { min: range[0], max: range[1] }, true);
  };

  return (
    <div className={styles.facetContainer}>
      <div className={styles.facetHeader}>
        <h3 className={styles.facetTitle}>{facet.displayName}</h3>
        {hasSelections && (
          <button 
            className={styles.clearFacetBtn}
            onClick={() => onClearFacet(facet.column)}
          >
            Clear
          </button>
        )}
      </div>
      
      {facet.valuesType === 'number' ? (
        <PriceRangeFilter
          min={facet.min}
          max={facet.max}
          selectedRange={selectedValues[0] ? [selectedValues[0].min, selectedValues[0].max] : null}
          onChange={handlePriceChange}
        />
      ) : (
        <>
          {showSearch && (
            <div className={styles.searchWrapper}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={`Search ${facet.displayName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          )}

          <div className={styles.valuesList}>
            {displayedValues.map((value) => (
              <label key={value.name} className={styles.valueLabel}>
                <input
                  type="checkbox"
                  checked={selectedValues.includes(value.name)}
                  onChange={() => onFilterChange(facet.column, value.name)}
                  className={styles.checkbox}
                />
                <span className={styles.valueName}>{value.name}</span>
                <span className={styles.valueCount}>({value.count})</span>
              </label>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={styles.showMoreBtn}
            >
              {isExpanded ? (
                <>Show Less <ChevronUp size={14} /></>
              ) : (
                <>Show More ({filteredValues.length - 10} more) <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};
