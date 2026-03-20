import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { personalizationService } from '../services/personalizationService';
import { contentStackService } from '../services/contentStackService';
import { Product } from '../types';

export const Home = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [heroBanner, setHeroBanner] = useState<any>(null);
  const [promoBanner, setPromoBanner] = useState<any>(null);

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
    <div id="home-page" className="space-y-20 pb-20 home-container">
      {/* Hero Section */}
      <section id="hero-section" className="relative h-[80vh] flex items-center overflow-hidden hero-banner">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920"}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 id="hero-title" className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-6">
              {heroBanner?.title || "DEFINE YOUR ELEGANCE."}
            </h1>
            <p id="hero-subtitle" className="text-lg md:text-xl text-zinc-200 mb-8 max-w-lg">
              {heroBanner?.subtitle || "Experience the pinnacle of luxury with our curated collection of premium fashion and lifestyle essentials."}
            </p>
            <div className="flex gap-4">
              <Link
                to={heroBanner?.cta_link || "/category/all"}
                className="bg-white text-zinc-900 px-8 py-4 rounded-full font-bold hover:bg-zinc-100 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {heroBanner?.cta_text || "Shop Collection"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/women"
                className="bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors cursor-pointer"
              >
                View Lookbook
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 categories-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/category/men" className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 category-card cursor-pointer">
            <img
              src="https://picsum.photos/seed/men-hero/800/1000"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Men"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold tracking-tight">Men</h3>
              <p className="text-sm opacity-80 mt-1">Explore Collection</p>
            </div>
          </Link>
          <Link to="/category/women" className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 category-card cursor-pointer">
            <img
              src="https://picsum.photos/seed/women-hero/800/1000"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Women"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold tracking-tight">Women</h3>
              <p className="text-sm opacity-80 mt-1">Explore Collection</p>
            </div>
          </Link>
          <Link to="/category/beauty" className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 category-card cursor-pointer">
            <img
              src="https://picsum.photos/seed/beauty-hero/800/1000"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Beauty"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold tracking-tight">Beauty</h3>
              <p className="text-sm opacity-80 mt-1">Explore Collection</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recommendations Carousel */}
      <section id="recommendations-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 recommendations-carousel">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 id="recommendations-title" className="text-3xl font-bold tracking-tight text-zinc-900">Recommended For You</h2>
            <p className="text-zinc-500 mt-2">Personalized picks based on your style.</p>
          </div>
          <Link to="/category/all" className="text-sm font-bold underline underline-offset-4 cursor-pointer">
            View All
          </Link>
        </div>
        <div id="recommendations-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Personalized Promo Banner */}
      {promoBanner && (
        <section id="promo-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 personalized-banner">
          <div className="relative h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer">
            <img src={promoBanner.image} alt={promoBanner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{promoBanner.title}</h2>
              <p className="text-xl text-zinc-200 mb-8">{promoBanner.subtitle}</p>
              <button className="bg-white text-zinc-900 px-8 py-4 rounded-full font-bold hover:bg-zinc-100 transition-colors cursor-pointer">
                Claim Offer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section id="newsletter-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 newsletter-container">
        <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-24 text-center text-white">
          <h2 id="newsletter-title" className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Join the Inner Circle</h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form id="newsletter-form" className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 focus:outline-none focus:border-white transition-colors"
            />
            <button className="bg-white text-zinc-900 px-8 py-4 rounded-full font-bold hover:bg-zinc-100 transition-colors cursor-pointer">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

