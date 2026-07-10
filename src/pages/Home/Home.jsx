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
import { Helper } from '../../helpers/helper';

export const Home = () => {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const [dyBanner, setDyBanner] = useState(null);
  const [categoryTilesData, setCategoryTilesData] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [featureBoxData, setFeatureBoxData] = useState(null);
  const [socialImagesData, setSocialImagesData] = useState(null);

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

    const fetchAmplienceContent = async (contentId, type = '') => {
      if (!amplienceClient) {
        return;
      }
      try {
        const response = await amplienceClient.getContentItemById(contentId);
        console.log(`Amplience data for ${type || contentId}:`, response);
        return response.body;
      } catch (error) {
        console.error('Amplience fetch failed:', error);
      }
    };

    const fetchData = async () => {
      const [recData, heroData, dyBanner, categoryTiles, blogData, featureBoxData, socialImagesData] = await Promise.all([
        personalizationService.getRecommendations({groups: ['home_page_recs'], isImplicitPageview: false, cart}),
        // hero
        contentStackService.getContent('banner_block', 'blte0ad912575f1ee77'),
        // dy banners
        personalizationService.getPersonalizedBanners({selectors: ['hp_hero'], isImplicitPageview: false, cart}),
        // dy category tiles
        personalizationService.getPersonalizedBanners({groups: ['hp_category_tiles'], isImplicitPageview: false, cart}),
        // blog posts
        fetchAmplienceContent('0d01cb20-6df3-414e-93fe-de248d118d6f', 'blog'),
        // feature box
        fetchAmplienceContent('7fed8e7e-a4f5-41cf-b78f-25e12ab8f151', 'featureBox'),
        //social images
        fetchAmplienceContent('5d323b25-9727-4633-934c-8adc00bd1e80', 'socialImages'),
      ]);
      setRecommendations(recData);
      setHeroBanner(heroData);
      setDyBanner(dyBanner);
      setCategoryTilesData(categoryTiles?.choices?.[0] ?? null);
      setBlogData(blogData);
      setFeatureBoxData(featureBoxData);
      setSocialImagesData(socialImagesData);
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
      <section className={`dy-feature-row ${styles.tileSection} ${styles.featuresSection}`}>
        {featureBoxData?.items && featureBoxData?.items.length > 0 && (
          <>
            <div className={styles.featuresGrid}>
              {featureBoxData.items.map((tile, idx) => (
                <Link to={categoryLinks[idx]} className={`dy-feature-${idx} ${styles.featureTile}`} key={idx} feature-pos={idx + 1}>
                  <img
                    src={Helper.getAmplienceImageUrl(tile?.imageholder?.image?.image)}
                    alt={tile?.imageholder?.imageAltText}
                  />
                  <div className={styles.featureTileOverlay} />
                  <div className={styles.featureTileContent}>
                    <h3 className={styles.featureTileTitle}>{tile?.title}</h3>
                    <p className={styles.featureTileCta}>{tile.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Blog */}
      <section className={`dy-blog-row ${styles.blogSection}`}>
        {blogData?.items && blogData?.items.length > 0 && (
          <div className={styles.blogGrid}>
            {blogData.items.map((post, idx) => (
              <Link
                key={idx}
                to={`${post.urls[0].url}`}
                className={`dy-blog-${idx} ${styles.blogItem} ${idx % 2 !== 0 ? styles.blogItemReverse : ''}`}
              >
                <div className={styles.blogTextBox}>
                  <h3 className={styles.blogTitle}>{post.blogcontent.title}</h3>
                  <p className={styles.blogBody}>{post.blogcontent.description}</p>
                </div>
                <div className={styles.blogImageBox}>
                  <img src={Helper.getAmplienceImageUrl(post?.blogcontent.image.image)} className={styles.blogImage} alt={post?.blogcontent.image?.altText} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Social Images */}
      <section className={`dy-social-row ${styles.socialSection}`}>
        {socialImagesData && (
          <>
            <div className={styles.socialHeader}>
              <h2 className={styles.socialTitle}>{socialImagesData?.title?.split('|')[0]}</h2>
              <p className={styles.socialSubtitle}>{socialImagesData?.title?.split('|')[1]}</p>
            </div>
            {socialImagesData?.items && socialImagesData?.items.length > 0 && (
              <div className={styles.socialGrid}>
                {socialImagesData.items.map((tile, idx) => (
                  <div className={`dy-social-${idx} ${styles.socialTile}`} key={idx}>
                    <img
                      src={Helper.getAmplienceImageUrl(tile?.imageholder?.image?.image)}
                      alt={tile?.imageholder?.imageAltText}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
