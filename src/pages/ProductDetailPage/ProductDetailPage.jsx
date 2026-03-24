import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Star, ShoppingBag, Heart, Shield, Truck, RotateCcw } from 'lucide-react';
import { personalizationService } from '../../services/personalizationService';
import { motion } from 'motion/react';
import { AddToCartButton } from '../../components/AddToCartButton/AddToCartButton';
import styles from './ProductDetailPage.module.css';
import { Helper } from '../../helpers/helper';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';

export const ProductDetailPage = () => {
  const productRating = Helper.getRandomRating();

  const { productId } = useParams();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [recData] = await Promise.all([
        personalizationService.getRecommendations({selectors: ['pdpRecs'], isImplicitPageview: false}),
      ]);
      setRecommendations(recData);
    };
    fetchData();
  }, []);


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
            <img src={Helper.getProductImage(product.image_url)} alt={product.name} className={styles.mainImage} />
          </motion.div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfoCol}>
          <div className={styles.productHeader}>
            <div className={styles.breadcrumbs}>
              <span className={styles.breadcrumbLink}>{Helper.getProducCategoriesDisplay(product.categories)}</span>
            </div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.productRating}>
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`${styles.starIcon} ${i <= Math.floor(product.rating || productRating) ? styles.filled : styles.empty}`} />
                ))}
              </div>
              <span className={styles.reviewsText}>{product.rating || productRating} ({product.reviews || Helper.getRandomReviewCount()} reviews)</span>
            </div>
          </div>

          <p className={styles.productPrice}>{formatPrice(product.price)}</p>

          <div className={styles.productActions}>
            <div className={styles.actionButtonsRow}>
              <AddToCartButton 
                product={product} 
                className={styles.addToCartBtn} 
                iconClass={styles.btnIcon} 
                showText={true} 
              />
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
                <p className={styles.featureDesc}>Free standard shipping on orders over {formatPrice(Helper.getFreeShippingThreshold())}.</p>
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

      {/* Recommendations */}
      <RecsCarousel recommendations={recommendations} additionalClass='pdp__recs' />
    </div>
  );
};
