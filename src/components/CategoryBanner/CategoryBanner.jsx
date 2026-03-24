import React, { useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import styles from './CategoryBanner.module.css';

export const CategoryBanner = ({ bannerConfig }) => {
  const { banners, loading, fetchBanner } = useContent();
  const bannerData = bannerConfig ? banners[bannerConfig.entryId] : null;
  const isBannerLoading = bannerConfig ? loading[bannerConfig.entryId] : false;

  useEffect(() => {
    if (bannerConfig) {
      fetchBanner(bannerConfig.contentType, bannerConfig.entryId);
    }
  }, [bannerConfig, fetchBanner]);

  if (isBannerLoading) {
    return <div className={styles.bannerPlaceholder}></div>;
  }

  if (!bannerData) {
    return null;
  }

  const { caption, subtitle, banner_image, cta_text, cta_link } = bannerData;

  return (
    <div 
      className={`category__banner ${styles.bannerContainer}`}
      style={{ 
        backgroundImage: banner_image ? `url(${banner_image.url})` : 'none' 
      }}
    >
      <div className={styles.bannerOverlay}>
        <div className={styles.bannerContent}>
          {caption && <h1 className={styles.bannerTitle}>{caption}</h1>}
          {subtitle && <p className={styles.bannerSubtitle}>{subtitle}</p>}
          {cta_text && cta_link && (
            <a href={cta_link} className={styles.bannerCta}>
              {cta_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
