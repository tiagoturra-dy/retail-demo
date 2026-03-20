import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
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
            src={product.image}
            alt={product.name}
            className={styles.productImage}
          />
          <div className={styles.productBadgeContainer}>
            <span className={styles.productBadge}>
              {product.subcategory}
            </span>
          </div>
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
            <span className={styles.ratingText}>{product.rating} ({product.reviews})</span>
          </div>
          <p className={styles.productPrice}>${product.price}</p>
        </div>
        <button
          onClick={() => addToCart(product)}
          className={styles.addToCartBtn}
        >
          <ShoppingBag className={styles.cartIcon} />
        </button>
      </div>
    </motion.div>
  );
};
