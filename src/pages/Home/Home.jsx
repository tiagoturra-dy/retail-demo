import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { personalizationService } from '../../services/personalizationService';
import { contentStackService } from '../../services/contentStackService';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';
import { useCart } from '../../context/CartContext';
import styles from './Home.module.css';
import { PromoBanner } from '../../components/PromoBanner/PromoBanner';

export const Home = () => {
  const { cart } = useCart();
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
        personalizationService.getRecommendations({groups: ['home_page_recs'], isImplicitPageview: false, cart}),
        // hero
        contentStackService.getContent('banner_block', 'blte0ad912575f1ee77'),
        personalizationService.getPersonalizedBanners({ cart }),
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
  }, [cart]);

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <PromoBanner id="dy-banner-1" additionalClass='dy-home-banner' content={heroBanner} />

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

      {/* Personalized Promo Banner */}
      {promoBanner ? (
        <PromoBanner 
          id="dy-banner-2"
          additionalClass='dy-home-banner' 
          content={{
            background_image: { url: promoBanner.image },
            display_title: promoBanner.title,
            subtitle: promoBanner.subtitle,
            link_url: promoBanner.link_url || '#',
            cta_text: promoBanner.cta_text || 'Claim Offer'
          }} 
          type="promo" 
        />
      ) : promoBannerData ? (
        <PromoBanner additionalClass='banner2' content={promoBannerData} type="promo" />
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
