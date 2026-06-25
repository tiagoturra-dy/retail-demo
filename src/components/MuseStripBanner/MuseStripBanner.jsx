import React from 'react';
import { useMuse } from '../../context/MuseContext';
import { MuseIcon } from '../../icons/MuseIcon/MuseIcon';
import styles from './MuseStripBanner.module.css';

export const MuseStripBanner = ({ query = '', className = '' }) => {
  const { openMuse } = useMuse();

  return (
    <button
      type="button"
      className={`${styles.banner} ${className}`}
      onClick={() => openMuse(query ? { query } : {})}
    >
      <MuseIcon />

      <span className={styles.text}>
        Ask AI assistant. <em className={styles.emphasis}>Style, curated for you!</em>
      </span>
    </button>
  );
};
