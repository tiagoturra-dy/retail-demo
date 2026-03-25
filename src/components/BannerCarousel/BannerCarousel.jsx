import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PromoBanner } from '../PromoBanner/PromoBanner';
import styles from './BannerCarousel.module.css';

export const BannerCarousel = ({ choice = {}, additionalClass = '', autoPlay = true, interval = 5000, type = 'hero' }) => {
  if (!choice || !choice.variations || choice.variations.length === 0) return null;
  const variations = choice.variations;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % variations.length);
  }, [variations.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + variations.length) % variations.length);
  }, [variations.length]);

  useEffect(() => {
    if (!autoPlay || variations.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, variations.length]);

  const buildContentStructure = (choice, index) => {
    const variation = choice.variations[index];
    return {
      ...variation.payload.data,
      type: variation.payload.type,
      decisionId: variation.decisionId || choice.decisionId,
      variationId: variation.id
    };
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  };

  const formatNumber = (num) => String(num + 1).padStart(2, '0');

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.carouselContainer}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={styles.slide}
          >
            <PromoBanner 
              additionalClass={additionalClass}
              content={buildContentStructure(choice, currentIndex)} 
              type={type}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Custom Indicators and Counter */}
      <div className={styles.controlsContainer}>
        <div className={styles.indicators}>
          {variations.map((_, index) => (
            <div
              key={index}
              className={`${styles.indicatorLine} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
        <div className={styles.counter}>
          <span className={styles.current}>{formatNumber(currentIndex)}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.total}>{formatNumber(variations.length - 1)}</span>
        </div>
      </div>
    </div>
  );
};
