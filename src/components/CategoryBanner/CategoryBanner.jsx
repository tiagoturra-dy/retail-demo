import React, { useEffect, useState } from 'react';
import { ContentClient } from 'dc-delivery-sdk-js';
import { Helper } from '../../helpers/helper';
import styles from './CategoryBanner.module.css';

export const CategoryBanner = ({ bannerConfig }) => {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bannerConfig?.entryId || !process.env.AMPLIENCE_HUB_NAME) return;

    const client = new ContentClient({
      hubName: process.env.AMPLIENCE_HUB_NAME,
      parameters: { depth: 'all', format: 'inlined' },
    });

    setLoading(true);
    client.getContentItemById(bannerConfig.entryId)
      .then((res) => {
        console.log('Amplience category banner response:', res.body);
        setBannerData(res.body);
      })
      .catch((err) => console.error('Amplience category banner fetch failed:', err))
      .finally(() => setLoading(false));
  }, [bannerConfig?.entryId]);

  if (loading) {
    return <div className={styles.bannerPlaceholder}></div>;
  }

  if (!bannerData) {
    return null;
  }

  const title = bannerData?.bannerText?.header;
  const imageUrl = Helper.getAmplienceImageUrl(bannerData?.image?.image);
  const vPosition = { top: 'top', middle: 'center', bottom: 'bottom' }[bannerData?.textPositioning?.textPositionVertical] ?? 'center';

  return (
    <div
      className={`category__banner ${styles.bannerContainer}`}
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundPosition: `center ${vPosition}`,
      }}
    >
      <div className={styles.bannerOverlay}>
        <div className={styles.bannerContent}>
          {title && <h1 className={styles.bannerTitle}>{title}</h1>}
        </div>
      </div>
    </div>
  );
};
