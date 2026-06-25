import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { personalizationService } from '../../services/personalizationService';
import styles from './PromoBanner.module.css';

export const PromoBanner = ({ additionalClass = '', content, type = "main" }) => {
  const position = (content?.layout?.position || 'center').toLowerCase();
  const verticalPositionValue = (content?.v_position || content?.layout?.v_position || 'middle').toLowerCase();
  const verticalPosition =
    verticalPositionValue === 'top'
      ? 'top'
      : verticalPositionValue === 'bottom'
        ? 'bottom'
        : 'middle';

  const containerPositionClass = 
    position === 'left'
      ? styles.left
      : position === 'right'
        ? styles.right
        : styles.center;
  const containerVerticalClass =
    verticalPosition === 'top'
      ? styles.top
      : verticalPosition === 'bottom'
        ? styles.bottom
        : styles.middle;

  const contentTypeClass = type === 'promo' ? styles.promoContent : styles.heroContent;

  const heroButtons = Array.isArray(content?.buttons) && content.buttons.length > 0
    ? content.buttons
    : content?.cta && content?.link
      ? [{ cta: content.cta, link: content.link }]
      : [];

  const handleTrackClick = () => {
    if (content?.decisionId && content?.variationId) {
      personalizationService.trackClick({ decisionId: content.decisionId, variationId: content.variationId });
    }
  };

  return (
    <section className={`${additionalClass} ${styles.heroSection}`} onMouseDown={handleTrackClick}>
      <div className={styles.heroBg}>
        <img
          src={content?.image}
          alt={content?.title}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
      </div>
      
      <div
        className={`${styles.heroContentContainer} ${containerPositionClass} ${containerVerticalClass}`}
        style={{ '--hero-content-color': content?.layout?.color || 'var(--color-white)' }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className={contentTypeClass}
        >
          <div className={styles.heroTexts}>
            <h1 className={styles.heroTitle}>
              {content?.title}
            </h1>
            <p className={styles.heroSubtitle}>
              {content?.subtitle}
            </p>
          </div>
          <div className={styles.heroActions}>
            {heroButtons.map((button, index) => {
              if (!button.link || !button.cta) return null;
              return (
                <Link
                  key={`${button.link || 'action'}-${index}`}
                  to={button.link}
                  className={styles.heroCta}
                >
                {button.cta}
                <ArrowRight className={styles.heroCtaIcon} />
              </Link>
            )})}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
