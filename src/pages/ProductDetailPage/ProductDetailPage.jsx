import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Star } from 'lucide-react';
import { personalizationService } from '../../services/personalizationService';
import { AddToCartButton } from '../../components/AddToCartButton/AddToCartButton';
import { AddToWishlistButton } from '../../components/AddToWishlistButton/AddToWishlistButton';
import styles from './ProductDetailPage.module.css';
import { Helper } from '../../helpers/helper';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';

export const ProductDetailPage = () => {
  const productRating = Helper.getRandomRating();
  const reviewCount = Helper.getRandomReviewCount(200);

  const { productId } = useParams();
  const { cart } = useCart();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [openAccordion, setOpenAccordion] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [altImageError, setAltImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [recData] = await Promise.all([
        personalizationService.getRecommendations({ groups: ['pdp_recs'], isImplicitPageview: false, cart }),
      ]);
      setRecommendations(recData);
    };
    fetchData();
  }, [cart]);

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

  const toggleAccordion = (key) => setOpenAccordion(prev => prev === key ? null : key);

  if (loading) {
    return <div className={styles.pdpLoading}>Loading...</div>;
  }

  if (!product) {
    return (
      <div className={styles.pdpNotFound}>
        <h2 className={styles.pdpNotFoundTitle}>Product not found</h2>
        <Link to="/" className={styles.pdpNotFoundLink}>Return Home</Link>
      </div>
    );
  }

  const markdownPct = product['type:number:markdown_percent'] || 0;
  const salePrice = product.price;
  const originalPrice = markdownPct > 0 ? salePrice / (1 - markdownPct / 100) : null;
  const rating = parseFloat(product['type:number:rating'] || productRating).toFixed(1);
  const reviews = product['type:number:reviews'] || reviewCount;
  const categories = Array.isArray(product.categories)
    ? product.categories
    : (product.categories || '').split('|').filter(Boolean);

  const accordions = [
    {
      key: 'details',
      label: 'DETAILS:',
      content: product.description,
    },
    {
      key: 'sizeFit',
      label: 'SIZE & FIT:',
      content: 'This product fits true to size.',
    },
    {
      key: 'delivery',
      label: 'DELIVERY AND RETURN',
      content: `Free standard shipping on orders over ${formatPrice(Helper.getFreeShippingThreshold())}. Easy 30-day returns for a full refund or exchange.`,
    },
  ];

  const Stars = ({ size = 'sm' }) => (
    <div className={styles.pdpStars}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${styles.pdpStar} ${size === 'sm' ? styles.pdpStarSm : ''} ${i <= Math.floor(rating) ? styles.pdpStarFilled : styles.pdpStarEmpty}`}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.pdpWrapper}>
      <div className={styles.pdpGrid}>

        {/* Left: Gallery */}
        <div className={styles.pdpGallery}>
          <img
            src={Helper.getProductImage(product.image_url)}
            alt={product.name}
            className={styles.pdpMainImage}
          />
          {product.alt_image && !altImageError && (
            <div className={styles.pdpThumbnails}>
              <div className={styles.pdpThumbItem}>
                <img src={Helper.getProductImage(product.alt_image)} alt={product.name} className={styles.pdpThumbImg} onError={() => setAltImageError(true)} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className={styles.pdpInfo}>

          {/* Breadcrumb */}
          <nav className={styles.pdpBreadcrumb}>
            <Link to="/" className={styles.pdpBreadcrumbLink}>HOME</Link>
            {categories.slice(0, 3).map((cat, i) => (
              <React.Fragment key={i}>
                <span className={styles.pdpBreadcrumbSep}>›</span>
                <span className={styles.pdpBreadcrumbLink}>{cat.toUpperCase()}</span>
              </React.Fragment>
            ))}
          </nav>

          {/* Title + Wishlist */}
          <div className={styles.pdpTitleRow}>
            <h1 className={styles.pdpTitle}>{product.name}</h1>
            <AddToWishlistButton product={product} className={styles.pdpWishlistBtn} />
          </div>

          {/* Price */}
          <div className={styles.pdpPriceRow}>
            <span id="pricep" className={styles.pdpSalePrice}>{formatPrice(salePrice)}</span>
            {originalPrice && (
              <span className={styles.pdpOriginalPrice}>{formatPrice(originalPrice)}</span>
            )}
          </div>

          {/* Rating */}
          <div className={styles.pdpRatingRow}>
            <Stars />
            <span className={styles.pdpRatingText}>{rating} ({reviews})</span>
          </div>

          {/* CTA */}
          <div id="dy-action-buttons" className={styles.pdpCtaRow}>
            <div className={styles.pdpQtyStepper}>
              <button className={styles.pdpQtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span className={styles.pdpQtyValue}>{quantity}</span>
              <button className={styles.pdpQtyBtn} onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">+</button>
            </div>
            <AddToCartButton
              product={product}
              quantity={quantity}
              className={styles.pdpAddToCartBtn}
              iconClass={styles.pdpAddToCartIcon}
              showText={true}
            />
          </div>

          {/* Promo Banner */}
          <div className={styles.pdpPromoBanner}>
            <span className={styles.pdpPromoText}>10% OFF FOR NEW CUSTOMERS</span>
            <button className={styles.pdpPromoSignUp}>SIGN UP NOW</button>
          </div>

          {/* Accordions */}
          {accordions.map(({ key, label, content }) => (
            <div key={key} className={styles.pdpAccordion}>
              <button className={styles.pdpAccordionHeader} onClick={() => toggleAccordion(key)}>
                <span className={styles.pdpAccordionLabel}>{label}</span>
                <span className={styles.pdpAccordionIcon}>{openAccordion === key ? '−' : '+'}</span>
              </button>
              {openAccordion === key && (
                <div className={styles.pdpAccordionContent}>{content}</div>
              )}
            </div>
          ))}

          {/* Reviews accordion */}
          <div className={`${styles.pdpAccordion} ${styles.pdpAccordionLast} ${styles.pdpAccordionReviews}`}>
            <div className={styles.pdpAccordionHeader}>
              <span className={styles.pdpAccordionLabel}>REVIEWS [{reviews}]</span>
              <div className={styles.pdpAccordionRatingSummary}>
                <Stars size="sm" />
                <span className={styles.pdpAccordionRatingValue}>{rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style It With */}
      {recommendations?.choices?.some(choice => choice.name === 'pdp_recs1') &&
        recommendations.choices.filter(choice => choice.name === 'pdp_recs1').map(choice => (
          <RecsCarousel id="dy-recs-1" key={choice.name} recommendations={{ choices: [choice] }} additionalClass='dy-pdp-recs' />
        ))
      }
    </div>
  );
};
