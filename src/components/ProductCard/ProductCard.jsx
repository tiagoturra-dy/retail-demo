import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Helper } from '../../helpers/helper';
import { AddToCartButton } from '../AddToCartButton/AddToCartButton';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={styles.productCard}
    >
      <Link to={`/product/${product.id}`} className={styles.productCardLink}>
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
          <Link to={`/product/${product.id}`} className={styles.productNameLink}>
            <h3 className={styles.productName}>
              {product.name}
            </h3>
          </Link>
          <div className={styles.productRating}>
            <Star className={styles.ratingIcon} />
            <span className={styles.ratingText}>{product.rating || Helper.getRandomRating()} ({product.reviews || Helper.getRandomReviewCount()})</span>
          </div>
          <p className={styles.productPrice}>${product.price}</p>
        </div>
        <AddToCartButton 
          product={product} 
          className={styles.addToCartBtn} 
          iconClass={styles.cartIcon} 
        />
      </div>
    </motion.div>
  );
};
