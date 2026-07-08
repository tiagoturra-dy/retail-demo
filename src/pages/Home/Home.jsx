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
import { ContentClient } from 'dc-delivery-sdk-js';

export const Home = () => {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const [dyBanner, setDyBanner] = useState(null);
  const [categoryTilesData, setCategoryTilesData] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [featureBoxData, setFeatureBoxData] = useState(null);

  const categoryLinks = [
    '/category/Men',
    '/category/Beauty',
    '/search?q=swim',
  ]

  useEffect(() => {
    const amplienceClient = process.env.AMPLIENCE_HUB_NAME
      ? new ContentClient({ 
        hubName: process.env.AMPLIENCE_HUB_NAME,
        parameters: {
          depth: 'all',
          format: 'inlined'
        }
       })
      : null;

    const fetchAmplienceContent = async (contentId) => {
      if (!amplienceClient) {
        return;
      }
      try {
        const response = await amplienceClient.getContentItemById(contentId);
        return response.body;
      } catch (error) {
        console.error('Amplience fetch failed:', error);
      }
    };

    const fetchData = async () => {
      const [recData, heroData, dyBanner, categoryTiles, blogData, featureBoxData] = await Promise.all([
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
        fetchAmplienceContent('5d323b25-9727-4633-934c-8adc00bd1e80'),
        // contentStackService.getMultipleContent('feature_box', ['bltb519043d64df59bd', 'blt8dcb1cfd02aadb79', 'blt734af01fcb4068cf'])
      ]);
      setRecommendations(recData);
      setHeroBanner(heroData);
      setDyBanner(dyBanner);
      setCategoryTilesData(categoryTiles?.choices?.[0] ?? null);
      setBlogData(blogData);
      setFeatureBoxData(featureBoxData);
    };
    fetchData();
  }, [cart]);

  const getAmplienceImageUrl = (imageObject) => {
    if (imageObject?.defaultHost && imageObject?.endpoint && imageObject?.name) {
      return `https://${imageObject.defaultHost}/i/${imageObject.endpoint}/${imageObject.name}`;
    }
    return '';
  };

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

      {/* Features */}
      <section className={`dy-feature-row ${styles.featuresSection}`}>
        {featureBoxData && (
          <>
            <div className={styles.featuresHeader}>
              <h2 className={styles.featuresTitle}>{featureBoxData?.title?.split('|')[0] || 'How You Wear It'}</h2>
              <p className={styles.featuresSubtitle}>{featureBoxData?.title?.split('|')[1] || 'See what our clients post on socials'}</p>
            </div>
            {featureBoxData?.items && featureBoxData?.items.length > 0 && (
              <div className={styles.featuresGrid}>
                {featureBoxData.items.map((tile, idx) => (
                  <Link to={categoryLinks[idx]} className={`dy-feature-${idx} ${styles.featureTile}`} key={tile.uid} feature-pos={idx + 1}>
                    <img
                      src={getAmplienceImageUrl(tile?.imageholder?.image?.image)}
                      className={styles.featureTileImage}
                      alt={tile?.imageholder?.imageAltText}
                    />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
