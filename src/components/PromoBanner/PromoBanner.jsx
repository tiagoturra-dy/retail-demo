import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './PromoBanner.module.css';

export const PromoBanner = ({ additionalClass = '', content, type = "main" }) => {
  return (
    <section className={`${additionalClass} ${styles.heroSection}`}>
      <div className={styles.heroBg}>
        <img
          src={content?.background_image?.url}
          alt={content?.display_title}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
      </div>
      
      <div className={styles.heroContentContainer}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className={type === 'main' ? styles.heroContent : styles.promoContent}
        >
          <h1 className={styles.heroTitle}>
            {content?.display_title}
          </h1>
          <p className={styles.heroSubtitle}>
            {content?.subtitle}
          </p>
          <div className={styles.heroActions}>
            <Link
              to={content?.link_url}
              className={styles.heroPrimaryBtn}
            >
              {content?.cta_text} <ArrowRight className={styles.heroBtnIcon} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


