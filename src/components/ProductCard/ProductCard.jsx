import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Helper } from '../../helpers/helper';
import { personalizationService } from '../../services/personalizationService';
import { AddToCartButton } from '../AddToCartButton/AddToCartButton';
import { AddToWishlistButton } from '../AddToWishlistButton/AddToWishlistButton';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product, compact = false, className = '', style, addToCartPosition, onNavigate }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleTrackClick = () => {
    console.log('ProductCard clicked:', product.name, 'DecisionId:', product.decisionId);
    if (product.decisionId) {
      personalizationService.trackClick({ decisionId: product.decisionId, variationId: product.variationId });
    } else {
      console.warn('No decisionId found for product:', product.name);
    }
    if (onNavigate) onNavigate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${className} ${styles.productCard} ${compact ? styles.compact : ''}`}
      style={style}
    >
      <div className={styles.productImageContainer}>
        <Link to={`/product/${product.sku}`} className={styles.productCardLink} onClick={handleTrackClick} data-skyu={product.sku}>
          <img
            src={Helper.getProductImage(product.image_url)}
            alt={product.name}
            className={styles.productImage}
          />
        </Link>
        <AddToWishlistButton product={product} className={styles.wishlistBtn} iconClass={styles.wishlistIcon} />
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
              <span className={styles.ratingText}>{parseFloat(product['type:number:rating'] || Helper.getRandomRating()).toFixed(1)} ({product['type:number:reviews'] || Helper.getRandomReviewCount()})</span>
            </div>
          )}
          <p className={`${styles.productPrice} ${compact ? styles.compactPrice : ''}`}>{formatPrice(product.price)}</p>
        </div>
        {(!compact || addToCartPosition === 'right') && (
          <AddToCartButton 
            product={product} 
            className={styles.addToCartBtn} 
            iconClass={styles.cartIcon} 
            trackProductClick={handleTrackClick}
            showFeedback={true}
            size={compact ? 14 : 24}
          />
        )}
      </div>
      {addToCartPosition === 'bottom' && (
        <AddToCartButton
          product={product}
          showText={true}
          showFeedback={true}
          className={styles.addToCartBtnBottom}
          iconClass={styles.cartIcon}
          trackProductClick={handleTrackClick}
          size={compact ? 14 : 24}
        />
      )}
    </motion.div>
  );
};
