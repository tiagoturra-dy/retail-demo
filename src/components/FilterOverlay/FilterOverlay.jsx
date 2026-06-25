import React, { useState, useMemo } from 'react';
import { Check, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import styles from './FilterOverlay.module.css';

const parsePriceRangeLabel = (label) => {
  const numbers = String(label || '').match(/\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) {
    return null;
  }

  return {
    min: Number(numbers[0]),
    max: Number(numbers[1]),
  };
};

const formatSelection = (facet, value) => {
  if (facet.valuesType === 'number' && typeof value === 'object') {
    return `$${Math.round(value.min)} - $${Math.round(value.max)}`;
  }

  return String(value);
};

const cloneFilters = (filtersState) => {
  return Object.fromEntries(
    Object.entries(filtersState).map(([column, values]) => [
      column,
      values.map((value) => (typeof value === 'object' ? { ...value } : value)),
    ])
  );
};

const getSelectedCount = (filtersState) => {
  return Object.values(filtersState).reduce((count, values) => count + values.length, 0);
};

export const FilterOverlay = ({
  facets,
  selectedFilters,
  onApplyFilters,
  onClearAllFilters,
  className = '',
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeFacetColumn, setActiveFacetColumn] = useState(null);
  const [draftFilters, setDraftFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const visibleFacets = useMemo(() => facets || [], [facets]);
  const activeFacet = useMemo(() => {
    return visibleFacets.find((facet) => facet.column === activeFacetColumn) || null;
  }, [activeFacetColumn, visibleFacets]);
  const totalSelectedFilters = useMemo(() => getSelectedCount(draftFilters), [draftFilters]);

  const selectedFilterChips = useMemo(() => {
    return visibleFacets.flatMap((facet) => {
      const selectedValues = draftFilters[facet.column] || [];
      return selectedValues.map((value, index) => ({
        key: `${facet.column}-${index}`,
        column: facet.column,
        value,
        label: formatSelection(facet, value),
      }));
    });
  }, [draftFilters, visibleFacets]);

  const filteredFacetValues = useMemo(() => {
    if (!activeFacet || activeFacet.valuesType === 'number') {
      return [];
    }

    if (!searchTerm) {
      return activeFacet.values || [];
    }

    return (activeFacet.values || []).filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeFacet, searchTerm]);

  const openOverlay = () => {
    setDraftFilters(cloneFilters(selectedFilters));
    setIsOverlayOpen(true);
    setActiveFacetColumn(null);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
    setActiveFacetColumn(null);
  };

  const handleApplyFilters = () => {
    onApplyFilters(draftFilters);
    closeOverlay();
  };

  const handleSelectFacet = (column) => {
    setActiveFacetColumn(column);
    setSearchTerm('');
  };

  const updateFacetValues = (column, updater) => {
    setDraftFilters((prev) => {
      const currentValues = prev[column] || [];
      const nextValues = updater(currentValues);

      if (!nextValues || nextValues.length === 0) {
        const nextState = { ...prev };
        delete nextState[column];
        return nextState;
      }

      return {
        ...prev,
        [column]: nextValues,
      };
    });
  };

  const handleToggleValue = (column, optionName) => {
    updateFacetValues(column, (currentValues) => {
      if (currentValues.includes(optionName)) {
        return currentValues.filter((value) => value !== optionName);
      }

      return [...currentValues, optionName];
    });
  };

  const handleRemoveChip = (column, valueToRemove) => {
    updateFacetValues(column, (currentValues) => {
      return currentValues.filter((value) => {
        if (typeof valueToRemove === 'object' && typeof value === 'object') {
          return !(value.min === valueToRemove.min && value.max === valueToRemove.max);
        }

        return value !== valueToRemove;
      });
    });
  };

  const handlePriceInputChange = (bound, inputValue) => {
    if (!activeFacet) {
      return;
    }

    const safeValue = Number(inputValue || 0);
    updateFacetValues(activeFacet.column, (currentValues) => {
      const base = currentValues[0] || { min: activeFacet.min, max: activeFacet.max };
      const nextRange = {
        ...base,
        [bound]: safeValue,
      };

      return [nextRange];
    });
  };

  const handleSelectPriceRange = (rangeLabel) => {
    if (!activeFacet) {
      return;
    }

    const parsed = parsePriceRangeLabel(rangeLabel);
    if (!parsed) {
      return;
    }

    updateFacetValues(activeFacet.column, () => [parsed]);
  };

  const clearDraftFilters = () => {
    setDraftFilters({});
  };

  const isPriceFacet = activeFacet?.valuesType === 'number';
  const activePriceValue = isPriceFacet
    ? (draftFilters[activeFacet.column]?.[0] || { min: activeFacet.min, max: activeFacet.max })
    : null;

  return (
    <>
      <button type="button" className={`${styles.filtersButton} ${className}`} onClick={openOverlay}>
        <SlidersHorizontal size={16} />
        <span>Filters</span>
        {getSelectedCount(selectedFilters) > 0 ? (
          <span className={styles.filtersButtonCount}>{getSelectedCount(selectedFilters)}</span>
        ) : null}
      </button>

      {isOverlayOpen ? (
        <div className={styles.filtersOverlay}>
          <button type="button" className={styles.filtersBackdrop} onClick={closeOverlay} aria-label="Close filters" />

          <div className={styles.filtersPanel}>
            <div className={styles.filtersPanelHeader}>
              <h2 className={styles.filtersPanelTitle}>{activeFacet ? activeFacet.displayName : 'Filters'}</h2>
              <button type="button" className={styles.closePanelBtn} onClick={closeOverlay} aria-label="Close panel">
                <X size={18} />
              </button>
            </div>

            <div className={styles.selectedChipsRow}>
              {selectedFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={styles.selectedChip}
                  onClick={() => handleRemoveChip(chip.column, chip.value)}
                >
                  <span>{chip.label}</span>
                  <X size={12} />
                </button>
              ))}
            </div>

            <div className={styles.filtersPanelBody}>
              {!activeFacet ? (
                <div className={styles.facetListView}>
                  {visibleFacets.map((facet) => {
                    const selectedCount = draftFilters[facet.column]?.length || 0;
                    return (
                      <button
                        key={facet.column}
                        type="button"
                        className={styles.facetListRow}
                        onClick={() => handleSelectFacet(facet.column)}
                      >
                        <span>
                          {facet.displayName}
                          {selectedCount > 0 ? ` [${selectedCount}]` : ''}
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    );
                  })}
                </div>
              ) : isPriceFacet ? (
                <div className={styles.priceFacetView}>
                  <div className={styles.priceInputsHeader}>
                    <label className={styles.priceField}>
                      <span className={styles.priceFieldLabel}>MIN ($)</span>
                      <input
                        type="number"
                        className={styles.priceInput}
                        value={Math.round(activePriceValue.min)}
                        onChange={(event) => handlePriceInputChange('min', event.target.value)}
                      />
                    </label>
                    <span className={styles.priceTo}>to</span>
                    <label className={styles.priceField}>
                      <span className={styles.priceFieldLabel}>MAX ($)</span>
                      <input
                        type="number"
                        className={styles.priceInput}
                        value={Math.round(activePriceValue.max)}
                        onChange={(event) => handlePriceInputChange('max', event.target.value)}
                      />
                    </label>
                  </div>

                  <div className={styles.facetListView}>
                    {(activeFacet.values || []).map((option) => {
                      const parsed = parsePriceRangeLabel(option.name);
                      const isSelected =
                        parsed &&
                        activePriceValue.min === parsed.min &&
                        activePriceValue.max === parsed.max;

                      return (
                        <button
                          key={option.name}
                          type="button"
                          className={styles.facetListRow}
                          onClick={() => handleSelectPriceRange(option.name)}
                        >
                          <span>{option.name} ({option.count})</span>
                          {isSelected ? <Check size={16} /> : <span />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={styles.textualFacetView}>
                  <div className={styles.searchWrapper}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder={`Search ${activeFacet.displayName}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                      autoFocus
                    />
                  </div>

                  <div className={styles.facetListView}>
                    {filteredFacetValues.map((option) => {
                      const isSelected = (draftFilters[activeFacet.column] || []).includes(option.name);

                      return (
                        <button
                          key={option.name}
                          type="button"
                          className={styles.facetListRow}
                          onClick={() => handleToggleValue(activeFacet.column, option.name)}
                        >
                          <span>{option.name} ({option.count})</span>
                          {isSelected ? <Check size={16} /> : <span />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.filtersFooter}>
              <button type="button" className={styles.footerSecondaryBtn} onClick={activeFacet ? () => setActiveFacetColumn(null) : clearDraftFilters}>
                {activeFacet ? 'BACK' : 'CLEAR ALL'}
              </button>
              <button type="button" className={styles.footerPrimaryBtn} onClick={handleApplyFilters}>
                VIEW ITEMS
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
