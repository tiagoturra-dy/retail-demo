import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { personalizationService } from '../../services/personalizationService';
import { contentStackService } from '../../services/contentStackService';
import './Home.css';

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
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <img
            src={heroBanner?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920"}
            alt="Hero"
            className="hero-image"
          />
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content-container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <h1 className="hero-title">
              {heroBanner?.title || "DEFINE YOUR ELEGANCE."}
            </h1>
            <p className="hero-subtitle">
              {heroBanner?.subtitle || "Experience the pinnacle of luxury with our curated collection of premium fashion and lifestyle essentials."}
            </p>
            <div className="hero-actions">
              <Link
                to={heroBanner?.cta_link || "/category/all"}
                className="hero-primary-btn"
              >
                {heroBanner?.cta_text || "Shop Collection"} <ArrowRight className="hero-btn-icon" />
              </Link>
              <Link
                to="/category/women"
                className="hero-secondary-btn"
              >
                View Lookbook
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section">
        <div className="categories-grid">
          <Link to="/category/men" className="category-card">
            <img
              src="https://picsum.photos/seed/men-hero/800/1000"
              className="category-image"
              alt="Men"
            />
            <div className="category-overlay" />
            <div className="category-content">
              <h3 className="category-title">Men</h3>
              <p className="category-subtitle">Explore Collection</p>
            </div>
          </Link>
          <Link to="/category/women" className="category-card">
            <img
              src="https://picsum.photos/seed/women-hero/800/1000"
              className="category-image"
              alt="Women"
            />
            <div className="category-overlay" />
            <div className="category-content">
              <h3 className="category-title">Women</h3>
              <p className="category-subtitle">Explore Collection</p>
            </div>
          </Link>
          <Link to="/category/beauty" className="category-card">
            <img
              src="https://picsum.photos/seed/beauty-hero/800/1000"
              className="category-image"
              alt="Beauty"
            />
            <div className="category-overlay" />
            <div className="category-content">
              <h3 className="category-title">Beauty</h3>
              <p className="category-subtitle">Explore Collection</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recommendations Carousel */}
      <section className="recommendations-section">
        <div className="recommendations-header">
          <div>
            <h2 className="recommendations-title">Recommended For You</h2>
            <p className="recommendations-subtitle">Personalized picks based on your style.</p>
          </div>
          <Link to="/category/all" className="recommendations-view-all">
            View All
          </Link>
        </div>
        <div className="recommendations-grid">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Personalized Promo Banner */}
      {promoBanner && (
        <section className="promo-section">
          <div className="promo-container">
            <img src={promoBanner.image} alt={promoBanner.title} className="promo-image" />
            <div className="promo-overlay" />
            <div className="promo-content">
              <h2 className="promo-title">{promoBanner.title}</h2>
              <p className="promo-subtitle">{promoBanner.subtitle}</p>
              <button className="promo-btn">
                Claim Offer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Join the Inner Circle</h2>
          <p className="newsletter-subtitle">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button className="newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
