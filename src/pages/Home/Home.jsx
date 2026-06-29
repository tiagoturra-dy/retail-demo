import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { personalizationService } from '../../services/personalizationService';
import { contentStackService } from '../../services/contentStackService';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';
import { useCart } from '../../context/CartContext';
import styles from './Home.module.css';
import { PromoBanner } from '../../components/PromoBanner/PromoBanner';
import { BannerCarousel } from '../../components/BannerCarousel/BannerCarousel';
import { CategoryTiles } from '../../components/CategoryTiles/CategoryTiles';

export const Home = () => {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const [dyBanner, setDyBanner] = useState(null);
  const [categoryTilesData, setCategoryTilesData] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [featureBoxData, setFeatureBoxData] = useState(null);
  const [promoBannerData, setPromoBannerData] = useState(null);

  const categoryLinks = [
    '/category/Men',
    '/category/Beauty',
    '/search?q=swim',
  ]

  useEffect(() => {
    const fetchData = async () => {
      const [recData, heroData, dyBanner, categoryTiles, blogData, featureBoxData, promoBanner] = await Promise.all([
        personalizationService.getRecommendations({groups: ['home_page_recs'], isImplicitPageview: false, cart}),
        // hero
        contentStackService.getContent('banner_block', 'blte0ad912575f1ee77'),
        // dy banners
        personalizationService.getPersonalizedBanners({selectors: ['hp_hero'], isImplicitPageview: false, cart}),
        // dy category tiles
        personalizationService.getPersonalizedBanners({groups: ['hp_category_tiles'], isImplicitPageview: false, cart}),
        // blog posts
        contentStackService.getMultipleContent('copy_of_blog_post', ['bltbf00c8dfb13c8300', 'blt4ba2c94b615d42b4', 'bltdcd85d58382a3c5f']),
        // feature box
        contentStackService.getMultipleContent('feature_box', ['bltb519043d64df59bd', 'blt8dcb1cfd02aadb79', 'blt734af01fcb4068cf']),
        // promo
        contentStackService.getContent('banner_block', 'bltd62f6a62c5796de8'),
      ]);
      setRecommendations(recData);
      setHeroBanner(heroData);
      setDyBanner(dyBanner);
      setCategoryTilesData(categoryTiles?.choices?.[0] ?? null);
      setBlogData(blogData);
      setFeatureBoxData(featureBoxData);
      setPromoBannerData(promoBanner);
    };
    fetchData();
  }, [cart]);

  const transformCSBanner = (data) => {
    if (!data) return null

    const buttons = Array.isArray(data.buttons) && data.buttons.length > 0
      ? data.buttons
      : data.cta_text && data.link_url
        ? [{ cta: data.cta_text, link: data.link_url }]
        : data.cta && data.link
          ? [{ cta: data.cta, link: data.link }]
          : []

    return {
      image: data.image || data.background_image?.url,
      title: data.title || data.display_title,
      subtitle: data.subtitle,
      buttons,
      layout: data.layout,
      v_position: data.v_position || data.layout?.v_position
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

      {/* Category Tiles */}
      {console.log('categoryTilesData:', categoryTilesData)}
      {categoryTilesData && (
        <CategoryTiles choice={categoryTilesData} />
      )}
      

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
      <section className={`dy-feature-row ${styles.featuresSection}`}>
        {featureBoxData && (
          <div className={styles.featuresGrid}>
            {featureBoxData.map((tile, idx) => (
              <Link to={categoryLinks[idx]} className={`dy-feature-${idx} ${styles.featureTile}`} key={tile.uid}>
                <img
                  src={tile.image.url}
                  className={styles.featureTileImage}
                  alt={tile.caption}
                />
                <div className={styles.featureTileOverlay} />
                <div className={styles.featureTileContent}>
                  <h3 className={styles.featureTileTitle}>{tile.caption}</h3>
                  {tile.subtitle && <span className={styles.featureTileCta}>{tile.subtitle}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      {promoBannerData ? (
        <PromoBanner additionalClass='banner2' content={transformCSBanner(promoBannerData)} type="promo" />
      ) : null}

      {/* Blog */}
      <section className={`dy-blog-row ${styles.blogSection}`}>
        {blogData && (
          <div className={styles.blogGrid}>
            {blogData.map((post, idx) => (
              <div
                key={post.uid}
                className={`dy-blog-${idx} ${styles.blogItem} ${idx % 2 !== 0 ? styles.blogItemReverse : ''}`}
              >
                <div className={styles.blogTextBox}>
                  <h3 className={styles.blogTitle}>{post.title}</h3>
                  <p className={styles.blogBody}>{post.subtitle}</p>
                </div>
                <div className={styles.blogImageBox}>
                  <img src={post.image.url} className={styles.blogImage} alt={post.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
