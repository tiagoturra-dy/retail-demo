import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Helper } from '../../helpers/helper';
import { personalizationService } from '../../services/personalizationService';
import { AddToCartButton } from '../AddToCartButton/AddToCartButton';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product, compact = false, className = '' }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const isWishlisted = isInWishlist(product?.sku);

  const handleTrackClick = () => {
    console.log('ProductCard clicked:', product.name, 'DecisionId:', product.decisionId);
    if (product.decisionId) {
      personalizationService.trackClick({ decisionId: product.decisionId, variationId: product.variationId });
    } else {
      console.warn('No decisionId found for product:', product.name);
    }
  };

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const sku = product?.sku;
    if (!sku) return;

    if (isInWishlist(sku)) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${className} ${styles.productCard} ${compact ? styles.compact : ''}`}
    >
      <div className={styles.productImageContainer}>
        <Link to={`/product/${product.sku}`} className={styles.productCardLink} onClick={handleTrackClick} data-skyu={product.sku}>
          <img
            src={Helper.getProductImage(product.image_url)}
            alt={product.name}
            className={styles.productImage}
          />
        </Link>
        <button
          type="button"
          className={styles.wishlistBtn}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlistClick}
        >
          <Heart className={styles.wishlistIcon} style={isWishlisted ? { color: 'var(--color-crimson)', fill: 'var(--color-crimson)' } : undefined} />
        </button>
      </div>
      <div className={styles.productInfoContainer}>
        <div className={styles.productDetails}>
          {product.brand && !compact &&
            <p className={styles.productBrand}>{product.brand}</p>
          }
          <Link to={`/product/${product.sku}`} className={styles.productNameLink} onClick={handleTrackClick}>
            <h3 className={`${styles.productName} ${compact ? styles.compactName : ''}`}>
              {product.name}
            </h3>
          </Link>
          {!compact && (
            <div className={styles.productRating}>
              <Star className={styles.ratingIcon} />
              <span className={styles.ratingText}>{product['type:number:rating'] || Helper.getRandomRating()} ({product['type:number:reviews'] || Helper.getRandomReviewCount()})</span>
            </div>
          )}
          <p className={`${styles.productPrice} ${compact ? styles.compactPrice : ''}`}>{formatPrice(product.price)}</p>
        </div>
        {!compact && (
          <AddToCartButton 
            product={product} 
            className={styles.addToCartBtn} 
            iconClass={styles.cartIcon} 
            trackProductClick={handleTrackClick}
          />
        )}
      </div>
    </motion.div>
  );
};
