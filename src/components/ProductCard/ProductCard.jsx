import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Helper } from '../../helpers/helper';
import { personalizationService } from '../../services/personalizationService';
import { AddToCartButton } from '../AddToCartButton/AddToCartButton';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product, compact = false }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleTrackClick = () => {
    console.log('ProductCard clicked:', product.name, 'DecisionId:', product.decisionId);
    if (product.decisionId) {
      personalizationService.trackClick({ decisionId: product.decisionId, variationId: product.variationId });
    } else {
      console.warn('No decisionId found for product:', product.name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${styles.productCard} ${compact ? styles.compact : ''}`}
    >
      <Link to={`/product/${product.sku}`} className={styles.productCardLink} onClick={handleTrackClick} data-skyu={product.sku}>
        <div className={styles.productImageContainer}>
          <img
            src={Helper.getProductImage(product.image_url)}
            alt={product.name}
            className={styles.productImage}
          />
        </div>
      </Link>
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
              <span className={styles.ratingText}>{product.rating || Helper.getRandomRating()} ({product.reviews || Helper.getRandomReviewCount()})</span>
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
