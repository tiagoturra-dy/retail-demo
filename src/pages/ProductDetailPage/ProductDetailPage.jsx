import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingBag, Heart, Shield, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import './ProductDetailPage.css';

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      const data = await catalogService.getProductById(productId);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div className="product-detail-loading">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2 className="not-found-title">Product not found</h2>
        <Link to="/" className="not-found-link">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-grid">
        {/* Image Gallery */}
        <div className="product-gallery">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="main-image-container"
          >
            <img src={product.image} alt={product.name} className="main-image" />
          </motion.div>
          <div className="thumbnail-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="thumbnail-container">
                <img src={`https://picsum.photos/seed/${product.id}-${i}/200/200`} alt="" className="thumbnail-image" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-col">
          <div className="product-header">
            <div className="breadcrumbs">
              <Link to={`/category/${product.category.toLowerCase()}`} className="breadcrumb-link">{product.category}</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{product.subcategory}</span>
            </div>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-rating">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`star-icon ${i <= Math.floor(product.rating) ? 'filled' : 'empty'}`} />
                ))}
              </div>
              <span className="reviews-text">{product.rating} ({product.reviews} reviews)</span>
            </div>
          </div>

          <p className="product-price">${product.price}</p>

          <div className="product-actions">
            <div className="action-buttons-row">
              <button
                onClick={() => addToCart(product)}
                className="add-to-cart-btn"
              >
                <ShoppingBag className="btn-icon" /> Add to Cart
              </button>
              <button className="wishlist-btn">
                <Heart className="wishlist-icon" />
              </button>
            </div>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Truck className="feature-icon" />
              </div>
              <div>
                <h4 className="feature-title">Free Shipping</h4>
                <p className="feature-desc">Free standard shipping on orders over $150.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <RotateCcw className="feature-icon" />
              </div>
              <div>
                <h4 className="feature-title">Easy Returns</h4>
                <p className="feature-desc">30-day return policy for a full refund.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Shield className="feature-icon" />
              </div>
              <div>
                <h4 className="feature-title">Secure Payment</h4>
                <p className="feature-desc">Your information is protected by 256-bit SSL encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
