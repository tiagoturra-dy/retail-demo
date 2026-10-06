import React from 'react';
import { Package, Eye, MessageSquare, ShoppingBag } from 'lucide-react';
import styles from './QuickActionsBar.module.css';

export const QuickActionsBar = ({ selectedProducts, onCompare, onFindSimilar, onAskAbout, onAddToCart }) => {
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
        <button
          className={`${styles.actionButton} ${hasMultiple ? styles.actionButtonActive : styles.actionButtonDisabled}`}
          onClick={handleCompare}
          disabled={!hasMultiple}
          title={hasMultiple ? 'Compare selected items' : 'Select at least 2 items to compare'}
          aria-label="Compare items"
        >
          <Eye size={16} />
        </button>

        <button
          className={`${styles.actionButton} ${count >= 1 ? styles.actionButtonActive : styles.actionButtonDisabled}`}
          onClick={handleFindSimilar}
          disabled={count < 1}
          title={count >= 1 ? 'Find similar items' : 'Select at least 1 item to find similar items'}
          aria-label="Find similar items"
        >
          <Package size={16} />
        </button>

        <button
          className={`${styles.actionButton} ${count >= 1 ? styles.actionButtonActive : styles.actionButtonDisabled}`}
          onClick={handleAskAbout}
          disabled={count < 1}
          title={count >= 1 ? 'Ask about selected items' : 'Select at least 1 item to ask about'}
          aria-label="Ask about items"
        >
          <MessageSquare size={16} />
        </button>

        {onAddToCart && (
          <button
            className={`${styles.actionButton} ${count >= 1 ? styles.actionButtonActive : styles.actionButtonDisabled}`}
            onClick={handleAddToCart}
            disabled={count < 1}
            title={count >= 1 ? 'Add selected items to cart' : 'Select at least 1 item to add to cart'}
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
