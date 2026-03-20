import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { personalizationService } from '../../services/personalizationService';
import { contentStackService } from '../../services/contentStackService';
import styles from './Home.module.css';

export const Home = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const [promoBanner, setPromoBanner] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [recData, heroData, promoData] = await Promise.all([
        personalizationService.getRecommendations(),
        contentStackService.getEntry('hero_banner', 'main-hero'),
        personalizationService.getPersonalizedBanners()
      ]);
      setRecommendations(recData);
      setHeroBanner(heroData);
      setPromoBanner(promoData[0]);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          <img
            src={heroBanner?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920"}
            alt="Hero"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>
        
        <div className={styles.heroContentContainer}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <h1 className={styles.heroTitle}>
              {heroBanner?.title || "DEFINE YOUR ELEGANCE."}
            </h1>
            <p className={styles.heroSubtitle}>
              {heroBanner?.subtitle || "Experience the pinnacle of luxury with our curated collection of premium fashion and lifestyle essentials."}
            </p>
            <div className={styles.heroActions}>
              <Link
                to={heroBanner?.cta_link || "/category/all"}
                className={styles.heroPrimaryBtn}
              >
                {heroBanner?.cta_text || "Shop Collection"} <ArrowRight className={styles.heroBtnIcon} />
              </Link>
              <Link
                to="/category/women"
                className={styles.heroSecondaryBtn}
              >
                View Lookbook
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesGrid}>
          <Link to="/category/men" className={styles.categoryCard}>
            <img
              src="https://picsum.photos/seed/men-hero/800/1000"
              className={styles.categoryImage}
              alt="Men"
            />
            <div className={styles.categoryOverlay} />
            <div className={styles.categoryContent}>
              <h3 className={styles.categoryTitle}>Men</h3>
              <p className={styles.categorySubtitle}>Explore Collection</p>
            </div>
          </Link>
          <Link to="/category/women" className={styles.categoryCard}>
            <img
              src="https://picsum.photos/seed/women-hero/800/1000"
              className={styles.categoryImage}
              alt="Women"
            />
            <div className={styles.categoryOverlay} />
            <div className={styles.categoryContent}>
              <h3 className={styles.categoryTitle}>Women</h3>
              <p className={styles.categorySubtitle}>Explore Collection</p>
            </div>
          </Link>
          <Link to="/category/beauty" className={styles.categoryCard}>
            <img
              src="https://picsum.photos/seed/beauty-hero/800/1000"
              className={styles.categoryImage}
              alt="Beauty"
            />
            <div className={styles.categoryOverlay} />
            <div className={styles.categoryContent}>
              <h3 className={styles.categoryTitle}>Beauty</h3>
              <p className={styles.categorySubtitle}>Explore Collection</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recommendations Carousel */}
      <section className={styles.recommendationsSection}>
        <div className={styles.recommendationsHeader}>
          <div>
            <h2 className={styles.recommendationsTitle}>Recommended For You</h2>
            <p className={styles.recommendationsSubtitle}>Personalized picks based on your style.</p>
          </div>
          <Link to="/category/all" className={styles.recommendationsViewAll}>
            View All
          </Link>
        </div>
        <div className={styles.recommendationsGrid}>
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Personalized Promo Banner */}
      {promoBanner && (
        <section className={styles.promoSection}>
          <div className={styles.promoContainer}>
            <img src={promoBanner.image} alt={promoBanner.title} className={styles.promoImage} />
            <div className={styles.promoOverlay} />
            <div className={styles.promoContent}>
              <h2 className={styles.promoTitle}>{promoBanner.title}</h2>
              <p className={styles.promoSubtitle}>{promoBanner.subtitle}</p>
              <button className={styles.promoBtn}>
                Claim Offer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterContainer}>
          <h2 className={styles.newsletterTitle}>Join the Inner Circle</h2>
          <p className={styles.newsletterSubtitle}>
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterBtn}>
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
