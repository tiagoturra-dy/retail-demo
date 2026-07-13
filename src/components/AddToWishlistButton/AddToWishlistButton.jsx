import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import styles from './AddToWishlistButton.module.css';

export const AddToWishlistButton = ({ product, className, iconClass }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const sku = product?.sku || product?.id;
  const isWishlisted = isInWishlist(sku);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sku) return;
    if (isWishlisted) {
      removeFromWishlist(sku);
    } else {
      addToWishlist({ ...product, id: sku });
      if (typeof DY !== 'undefined') {
        DY.API('event', {
          name: 'Add to Wishlist',
          properties: { dyType: 'add-to-wishlist-v1', productId: sku },
        });
      }
    }
  };

  return (
    <button
      type="button"
      className={`${styles.wishlistBtn} ${className || ''}`}
      onClick={handleClick}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`${styles.wishlistIcon} ${iconClass || ''}`}
        style={isWishlisted ? { color: 'var(--color-crimson)', fill: 'var(--color-crimson)' } : undefined}
      />
    </button>
  );
};
