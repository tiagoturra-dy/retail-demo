import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card"
    >
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
          <div className="product-badge-container">
            <span className="product-badge">
              {product.subcategory}
            </span>
          </div>
        </div>
      </Link>
      <div className="product-info-container">
        <div className="product-details">
          <Link to={`/product/${product.id}`} className="product-name-link">
            <h3 className="product-name">
              {product.name}
            </h3>
          </Link>
          <div className="product-rating">
            <Star className="rating-icon" />
            <span className="rating-text">{product.rating} ({product.reviews})</span>
          </div>
          <p className="product-price">${product.price}</p>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="add-to-cart-btn"
        >
          <ShoppingBag className="cart-icon" />
        </button>
      </div>
    </motion.div>
  );
};
