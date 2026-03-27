import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import styles from './MyPage.module.css';

// --- MOCK DATA ---
const MOCK_HERO_DATA = {
  tagline: "SEASONAL SELECTION",
  title: "Animal\nInstinct",
  description: "Unleash the wild within. A curated editorial of the season's boldest patterns, texturized to perfection for your unique aesthetic.",
  images: [
    "https://picsum.photos/seed/leopard/800/800", // Leopard print fabric
    "https://picsum.photos/seed/bag/400/400", // Bag
    "https://picsum.photos/seed/shoes/400/400", // Shoes/Scarf
  ]
};

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

const MOCK_COMPLETE_SET = [
  { id: 9, name: "Mulberry Silk Case", price: 45, image: "https://picsum.photos/seed/silk/300/300" },
  { id: 10, name: "Oak Desk Organizer", price: 89, image: "https://picsum.photos/seed/desk/300/300" },
  { id: 11, name: "Glass Hydration Vessel", price: 32, image: "https://picsum.photos/seed/glass/300/300" },
  { id: 12, name: "M-Type Mechanical Key", price: 210, image: "https://picsum.photos/seed/keyboard/300/300" },
  { id: 13, name: "Modernist Architecture", price: 65, image: "https://picsum.photos/seed/arch/300/300" },
];

export const MyPage = () => {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    // Simulate API call to DY Personalization API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.myPageContainer}>
      
      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextContent}>
            <span className={styles.heroTagline}>{MOCK_HERO_DATA.tagline}</span>
            <h1 className={styles.heroTitle}>
              {MOCK_HERO_DATA.title.split('\n').map((line, i) => (
                <span key={i} className={styles.heroTitleLine}>{line}</span>
              ))}
            </h1>
            <p className={styles.heroDescription}>{MOCK_HERO_DATA.description}</p>
          </div>
          
          <div className={styles.heroImagesContainer}>
            <div className={styles.heroImageMain}>
              <img src={MOCK_HERO_DATA.images[0]} alt="Main editorial" className={styles.image} referrerPolicy="no-referrer" />
              <button className={styles.shopTheLookBtn}>Shop The Look</button>
            </div>
            <div className={styles.heroImageSecondary}>
              <div className={styles.heroImageTopRight}>
                <img src={MOCK_HERO_DATA.images[1]} alt="Editorial detail 1" className={styles.image} referrerPolicy="no-referrer" />
              </div>
              <div className={styles.heroImageBottomRight}>
                <img src={MOCK_HERO_DATA.images[2]} alt="Editorial detail 2" className={styles.image} referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUE SHOPPING DEALS */}
      <section className={styles.dealsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Continue shopping deals</h2>
            <p className={styles.sectionSubtitle}>Items from your recent browsing, now at a better price.</p>
          </div>
          <button className={styles.viewAllBtn}>
            View All <ArrowRight className={styles.viewAllIcon} />
          </button>
        </div>
        
        <div className={styles.dealsGrid}>
          {MOCK_CONTINUE_SHOPPING.map((product) => (
            <div key={product.id} className={styles.dealCard}>
              <div className={styles.dealImageWrapper}>
                <span className={styles.discountBadge}>{product.discount}</span>
                <img src={product.image} alt={product.name} className={styles.dealImage} referrerPolicy="no-referrer" />
              </div>
              <div className={styles.dealInfo}>
                <h3 className={styles.dealName}>{product.name}</h3>
                <div className={styles.dealPricing}>
                  <span className={styles.dealPrice}>{formatPrice(product.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GIFT IDEAS */}
      <section className={styles.giftsSection}>
        <div className={styles.giftsContent}>
          <div className={styles.giftsTextContent}>
            <span className={styles.heroTagline}>THOUGHTFULLY CURATED</span>
            <h2 className={styles.giftsTitle}>Gift ideas<br/>inspired by you</h2>
            <p className={styles.giftsDescription}>
              Refined selections for your inner circle, tailored to your premium tastes in luxury accessories and home ambiance.
            </p>
          </div>
          
          <div className={styles.giftsGrid}>
            {MOCK_GIFT_IDEAS.map((product) => (
              <div key={product.id} className={styles.giftCard}>
                <div className={styles.giftImageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.giftImage} referrerPolicy="no-referrer" />
                </div>
                <div className={styles.giftInfo}>
                  <div>
                    <h3 className={styles.giftName}>{product.name}</h3>
                    <p className={styles.giftSubtitle}>{product.subtitle}</p>
                  </div>
                  <span className={styles.giftPrice}>{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLETE THE SET */}
      <section className={styles.completeSetSection}>
        <div className={styles.completeSetContainer}>
          <div className={styles.completeSetHeader}>
            <div>
              <h2 className={styles.completeSetTitle}>Complete the Set</h2>
              <p className={styles.completeSetSubtitle}>Recommended based on items currently in your cart.</p>
            </div>
          </div>
          
          <div className={styles.completeSetGrid}>
            {MOCK_COMPLETE_SET.map((product) => (
              <div key={product.id} className={styles.setCard}>
                <div className={styles.setImageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.setImage} referrerPolicy="no-referrer" />
                </div>
                <div className={styles.setInfo}>
                  <h3 className={styles.setName}>{product.name}</h3>
                  <span className={styles.setPrice}>{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
