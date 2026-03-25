import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { personalizationService } from '../../services/personalizationService';
import { contentStackService } from '../../services/contentStackService';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';
import { useCart } from '../../context/CartContext';
import styles from './Home.module.css';
import { PromoBanner } from '../../components/PromoBanner/PromoBanner';
import { BannerCarousel } from '../../components/BannerCarousel/BannerCarousel';

export const Home = () => {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const [dyBanner, setDyBanner] = useState(null);
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
      const [recData, heroData, dyBanner, blogData, categoryData, featureBoxData, promoBanner] = await Promise.all([
        personalizationService.getRecommendations({groups: ['home_page_recs'], isImplicitPageview: false, cart}),
        // hero
        contentStackService.getContent('banner_block', 'blte0ad912575f1ee77'),
        // dy banners
        personalizationService.getPersonalizedBanners({selectors: ['hp_hero'], isImplicitPageview: false, cart}),
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
      setDyBanner(dyBanner);
      setBlogData(blogData);
      setCategoryData(categoryData);
      setFeatureBoxData(featureBoxData);
      setPromoBannerData(promoBanner);
    };
    fetchData();
  }, [cart]);

  const transformCSBanner = (data) => {
    if (!data) return null
    return {
      image: data.background_image.url,
      title: data.display_title,
      subtitle: data.subtitle,
      link: data.link_url,
      cta: data.cta_text
    }
  }

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      {dyBanner?.choices?.length > 0 ? (
        <BannerCarousel 
          id="dy-banner-1" 
          additionalClass='dy-home-banner' 
          type="hero" 
          choice={dyBanner.choices[0]} 
        />
      ) : promoBannerData ? (
        <PromoBanner id="dy-banner-1" additionalClass='dy-home-banner' content={transformCSBanner(heroBanner)} type="hero" />
      ) : null}
      

      {/* Recommendations */}
      {recommendations?.choices?.some(choice => choice.name === 'hp_recs1') &&
        recommendations?.choices?.filter(choice => choice.name === 'hp_recs1').map(choice => (
          <RecsCarousel id="dy-recs-1" key={choice.name} recommendations={{choices: [choice]}} additionalClass='dy-home-recs' />
        ))
      }

      {/* Recommendations */}
      {recommendations?.choices?.some(choice => choice.name === 'hp_recs2') &&
        recommendations?.choices?.filter(choice => choice.name === 'hp_recs2').map(choice => (
          <RecsCarousel id="dy-recs-2" key={choice.name} recommendations={{choices: [choice]}} additionalClass='dy-home-recs' />
        ))
      }

      {/* Features */}
      <section className={`dy-feature-row ${styles.tileSection} ${styles.featuresSection}`}>
        {featureBoxData && (
          <>
            <div className={styles.tileGrid}>
              {featureBoxData.map((tile, idx) => (
                <Link to={categoryLinks[idx]} className={`dy-feature-${idx} ${styles.tileCard}`} key={tile.uid}>
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

      {/* Featured Categories */}
      <section className={`dy-article-row ${styles.tileSection}`}>
        {categoryData && (
          <>
            <div className={styles.tileGrid}>
              {categoryData.map((tile, idx) => (
                <Link to={categoryLinks[idx]} className={`dy-article-${idx} ${styles.tileCard}`} key={tile.uid}>
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

      {/* Promo Banner */}
      {promoBannerData ? (
        <PromoBanner additionalClass='banner2' content={transformCSBanner(promoBannerData)} type="promo" />
      ) : null}

      {/* Blog */}
      <section className={`dy-blog-row ${styles.tileSection}`}>
        {blogData && (
          <>
            <div className={styles.tileGrid}>
              {blogData.map((tile, idx) => (
                <div className={`dy-blog-${idx} ${styles.tileCard}`} key={tile.uid}>
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
