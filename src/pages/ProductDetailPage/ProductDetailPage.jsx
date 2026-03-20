import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingBag, Heart, Shield, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './ProductDetailPage.module.css';

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
    return <div className={styles.productDetailLoading}>Loading...</div>;
  }

  if (!product) {
    return (
      <div className={styles.productDetailNotFound}>
        <h2 className={styles.notFoundTitle}>Product not found</h2>
        <Link to="/" className={styles.notFoundLink}>Return Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.productDetailGrid}>
        {/* Image Gallery */}
        <div className={styles.productGallery}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.mainImageContainer}
          >
            <img src={product.image} alt={product.name} className={styles.mainImage} />
          </motion.div>
          <div className={styles.thumbnailGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.thumbnailContainer}>
                <img src={`https://picsum.photos/seed/${product.id}-${i}/200/200`} alt="" className={styles.thumbnailImage} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfoCol}>
          <div className={styles.productHeader}>
            <div className={styles.breadcrumbs}>
              <Link to={`/category/${product.category.toLowerCase()}`} className={styles.breadcrumbLink}>{product.category}</Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{product.subcategory}</span>
            </div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.productRating}>
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`${styles.starIcon} ${i <= Math.floor(product.rating) ? styles.filled : styles.empty}`} />
                ))}
              </div>
              <span className={styles.reviewsText}>{product.rating} ({product.reviews} reviews)</span>
            </div>
          </div>

          <p className={styles.productPrice}>${product.price}</p>

          <div className={styles.productActions}>
            <div className={styles.actionButtonsRow}>
              <button
                onClick={() => addToCart(product)}
                className={styles.addToCartBtn}
              >
                <ShoppingBag className={styles.btnIcon} /> Add to Cart
              </button>
              <button className={styles.wishlistBtn}>
                <Heart className={styles.wishlistIcon} />
              </button>
            </div>
          </div>

          <div className={styles.productFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrapper}>
                <Truck className={styles.featureIcon} />
              </div>
              <div>
                <h4 className={styles.featureTitle}>Free Shipping</h4>
                <p className={styles.featureDesc}>Free standard shipping on orders over $150.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrapper}>
                <RotateCcw className={styles.featureIcon} />
              </div>
              <div>
                <h4 className={styles.featureTitle}>Easy Returns</h4>
                <p className={styles.featureDesc}>30-day return policy for a full refund.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrapper}>
                <Shield className={styles.featureIcon} />
              </div>
              <div>
                <h4 className={styles.featureTitle}>Secure Payment</h4>
                <p className={styles.featureDesc}>Your information is protected by 256-bit SSL encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
