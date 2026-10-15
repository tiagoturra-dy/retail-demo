import React from 'react';
import { CompareIcon } from '../../icons/CompareIcon/CompareIcon';
import { SearchSimilarIcon } from '../../icons/SearchSimilarIcon/SearchSimilarIcon';
import { AskIcon } from '../../icons/AskIcon/AskIcon';
import { AddToBagIcon } from '../../icons/AddToBagIcon/AddToBagIcon';
import styles from './QuickActionsBar.module.css';

export const QuickActionsBar = ({ selectedProducts, onCompare, onFindSimilar, onAskAbout, onAddToCart, isAddingToCart = false }) => {
  const count = selectedProducts?.length || 0;
  const hasMultiple = count >= 2;

  const handleCompare = () => {
    if (hasMultiple) {
      onCompare?.(selectedProducts);
    }
  };

  const handleFindSimilar = () => {
    if (count >= 1) {
      onFindSimilar?.(selectedProducts);
    }
  };

  const handleAskAbout = () => {
    if (count >= 1) {
      onAskAbout?.(selectedProducts);
    }
  };

  const handleAddToCart = () => {
    if (count >= 1) {
      onAddToCart?.(selectedProducts);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span className={styles.infoText}>
          {count} item{count !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className={styles.actions}>
        {hasMultiple && (
          <button
            className={`${styles.actionButton} ${styles.actionButtonActive}`}
            onClick={handleCompare}
            title="Compare selected items"
            aria-label="Compare items"
          >
            <CompareIcon size={24} />
          </button>
        )}

        <button
          className={`${styles.actionButton} ${count >= 1 ? styles.actionButtonActive : styles.actionButtonDisabled}`}
          onClick={handleFindSimilar}
          disabled={count < 1}
          title={count >= 1 ? 'Find similar items' : 'Select at least 1 item to find similar items'}
          aria-label="Find similar items"
        >
          <SearchSimilarIcon size={24} />
        </button>

        <button
          className={`${styles.actionButton} ${count >= 1 ? styles.actionButtonActive : styles.actionButtonDisabled}`}
          onClick={handleAskAbout}
          disabled={count < 1}
          title={count >= 1 ? 'Ask about selected items' : 'Select at least 1 item to ask about'}
          aria-label="Ask about items"
        >
          <AskIcon size={24} />
        </button>

        {onAddToCart && (
          <button
            className={`${styles.actionButton} ${count >= 1 && !isAddingToCart ? styles.actionButtonActive : styles.actionButtonDisabled}`}
            onClick={handleAddToCart}
            disabled={count < 1 || isAddingToCart}
            title={isAddingToCart ? 'Adding to cart...' : count >= 1 ? 'Add selected items to cart' : 'Select at least 1 item to add to cart'}
            aria-label="Add to cart"
          >
            {isAddingToCart ? (
              <div className={styles.loadingDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            ) : (
              <AddToBagIcon size={24} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
