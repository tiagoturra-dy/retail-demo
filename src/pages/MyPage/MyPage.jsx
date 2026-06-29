import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import styles from './MyPage.module.css';

// --- MOCK DATA ---
const MOCK_CONTINUE_SHOPPING = [
  { id: 1, name: "Series X Minimalist Watch", price: 180, discount: "-20%", image: "https://picsum.photos/seed/watch/400/400" },
  { id: 2, name: "Acoustic Pro Headphones", price: 295, discount: "-18%", image: "https://picsum.photos/seed/headphones/400/400" },
  { id: 3, name: "Velocity Runner v2", price: 90, discount: "-30%", image: "https://picsum.photos/seed/shoes2/400/400" },
  { id: 4, name: "Retro Instant Camera", price: 115, discount: "-10%", image: "https://picsum.photos/seed/camera/400/400" },
];

const MOCK_GIFT_IDEAS = [
  { id: 5, name: "Midnight Oak Candle", subtitle: "Luxury Home Fragrance", price: 75, image: "https://picsum.photos/seed/candle/600/800" },
  { id: 6, name: "Linear Gold Ring", subtitle: "Fine Jewelry Collection", price: 420, image: "https://picsum.photos/seed/ring/600/800" },
  { id: 7, name: "Nautical Chronograph", subtitle: "Precision Timepieces", price: 890, image: "https://picsum.photos/seed/chrono/600/800" },
  { id: 8, name: "Heirloom Journal", subtitle: "Bespoke Stationery", price: 125, image: "https://picsum.photos/seed/journal/600/800" },
];

export const MyPage = () => {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/my-page' } });
      return;
    }
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const firstName = user.DisplayName || user.name?.split(' ')[0] || user.Name?.split(' ')[0];

  return (
    <div className={styles.page}>

      {/* PAGE HEADER */}
      <section className={styles.pageHeader}>
        <p className={styles.pageHeaderTagline}>MY ACCOUNT</p>
        <h1 className={styles.pageHeaderTitle}>Welcome back{firstName ? `, ${firstName}` : ''}</h1>
      </section>

      {/* WISHLIST */}
      <section className={`${styles.section} ${styles.wishlistSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>My Wishlist</h2>
            <p className={styles.sectionSubtitle}>{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <Heart className={styles.emptyWishlistIcon} />
            <p className={styles.emptyWishlistText}>Your wishlist is empty.</p>
            <Link to="/category/Women" className={styles.emptyWishlistCta}>Start browsing</Link>
          </div>
        ) : (
          <div className={styles.wishlistGrid}>
            {wishlist.map((product) => {
              const id = product.sku || product.id;
              return (
                <ProductCard
                  key={id}
                  product={{ ...product, sku: id, image_url: product.image_url || product.image }}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* CONTINUE SHOPPING */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Continue shopping deals</h2>
            <p className={styles.sectionSubtitle}>Items from your recent browsing, now at a better price.</p>
          </div>
          <button className={styles.viewAllBtn}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className={styles.dealsGrid}>
          {MOCK_CONTINUE_SHOPPING.map((product) => (
            <div key={product.id} className={styles.dealCard}>
              <div className={styles.dealImageBox}>
                <span className={styles.discountBadge}>{product.discount}</span>
                <img src={product.image} alt={product.name} className={styles.dealImage} referrerPolicy="no-referrer" />
              </div>
              <div className={styles.dealInfo}>
                <p className={styles.dealName}>{product.name}</p>
                <p className={styles.dealPrice}>{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GIFT IDEAS */}
      <section className={styles.giftsSection}>
        <div className={styles.giftsInner}>
          <div className={styles.giftsText}>
            <span className={styles.giftsTagline}>THOUGHTFULLY CURATED</span>
            <h2 className={styles.giftsTitle}>Gift ideas<br />inspired by you</h2>
            <p className={styles.giftsBody}>
              Refined selections for your inner circle, tailored to your premium tastes.
            </p>
          </div>
          <div className={styles.giftsGrid}>
            {MOCK_GIFT_IDEAS.map((product) => (
              <div key={product.id} className={styles.giftCard}>
                <div className={styles.giftImageBox}>
                  <img src={product.image} alt={product.name} className={styles.giftImage} referrerPolicy="no-referrer" />
                </div>
                <div className={styles.giftInfo}>
                  <div>
                    <p className={styles.giftName}>{product.name}</p>
                    <p className={styles.giftSubtitle}>{product.subtitle}</p>
                  </div>
                  <span className={styles.giftPrice}>{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

