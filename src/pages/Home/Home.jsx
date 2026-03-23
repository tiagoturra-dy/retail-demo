import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { personalizationService } from '../../services/personalizationService';
import { contentStackService } from '../../services/contentStackService';
import styles from './Home.module.css';
import { PromoBanner } from '../../components/PromoBanner/PromoBanner';

export const Home = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const [promoBanner, setPromoBanner] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [featureBoxData, setFeatureBoxData] = useState(null);
  const [promoBannerData, setPromoBannerData] = useState(null);

  const categoryLinks = [
    '/category/Men',
    '/category/Beauty',
    '/search?q=swim',
  ]

  useEffect(() => {
    const fetchData = async () => {
      const [recData, heroData, promoData, blogData, categoryData, featureBoxData, promoBanner] = await Promise.all([
        personalizationService.getRecommendations({selectors: ['hp_recs'], isImplicitPageview: false}),
        // hero
        contentStackService.getContent('banner_block', 'blte0ad912575f1ee77'),
        personalizationService.getPersonalizedBanners(),
        // blog posts
        contentStackService.getMultipleContent('copy_of_blog_post', ['bltbf00c8dfb13c8300', 'blt4ba2c94b615d42b4', 'bltdcd85d58382a3c5f']),
        // featured categories
        contentStackService.getMultipleContent('article_box', ['bltef643043a7c5fb9b', 'blt549fadcc70f892df', 'bltccf28b95c2a9159c']),
        // feature box
        contentStackService.getMultipleContent('feature_box', ['bltb519043d64df59bd', 'blt8dcb1cfd02aadb79', 'blt734af01fcb4068cf']),
        // promo
        contentStackService.getContent('banner_block', 'bltd62f6a62c5796de8'),
      ]);
      setRecommendations(recData);
      setHeroBanner(heroData);
      setPromoBanner(promoData[0]);
      setBlogData(blogData);
      setCategoryData(categoryData);
      setFeatureBoxData(featureBoxData);
      setPromoBannerData(promoBanner);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <PromoBanner additionalClass='banner1' content={heroBanner} />

      {/* Features */}
      <section className={`feature__row ${styles.tileSection} ${styles.featuresSection}`}>
        {featureBoxData && (
          <>
            <div className={styles.tileGrid}>
              {featureBoxData.map((tile, idx) => (
                <Link to={categoryLinks[idx]} className={`feature_${idx} ${styles.tileCard}`} key={tile.uid}>
                  <img
                    src={tile.image.url}
                    className={styles.tileImage}
                    alt={tile.caption}
                  />
                  <div className={styles.tileOverlay} />
                  <div className={styles.tileContent}>
                    <h3 className={styles.tileTitle}>{tile.caption}</h3>
                    <p className={styles.tileSubtitle}>{tile.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Recommendations Carousel */}
      <section className={styles.recommendationsSection}>
        <div id="hpRecs" className='hp__recs'></div>
      </section>

      {/* Featured Categories */}
      <section className={`article__row ${styles.tileSection}`}>
        {categoryData && (
          <>
            <div className={styles.tileGrid}>
              {categoryData.map((tile, idx) => (
                <Link to={categoryLinks[idx]} className={`article_${idx} ${styles.tileCard}`} key={tile.uid}>
                  <img
                    src={tile.image.url}
                    className={styles.tileImage}
                    alt={tile.title}
                  />
                  <div className={styles.tileOverlay} />
                  <div className={styles.tileContent}>
                    <h3 className={styles.tileTitle}>{tile.title}</h3>
                    <p className={styles.tileSubtitle}>{tile.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Personalized Promo Banner */}
      <PromoBanner additionalClass='banner2' content={promoBannerData} type="promo" />
      {/* TODO: FIX */}
      {promoBanner && (
        <section className={`banner2 ${styles.promoSection}`}>
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

      {/* Blog */}
      <section className={styles.tileSection}>
        {blogData && (
          <>
            <div className={styles.tileGrid}>
              {blogData.map((tile, idx) => (
                <div className={`blog_${idx} ${styles.tileCard}`} key={tile.uid}>
                  <img
                    src={tile.image.url}
                    className={styles.tileImage}
                    alt={tile.title}
                  />
                  <div className={styles.tileOverlay} />
                  <div className={styles.tileContent}>
                    <h3 className={styles.tileTitle}>{tile.title}</h3>
                    <p className={styles.tileSubtitle}>{tile.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
