import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { PromoBanner } from '../PromoBanner/PromoBanner';
import styles from './BannerCarousel.module.css';

export const BannerCarousel = ({ choice = {}, additionalClass = '', autoPlay = true, interval = 10000, transitionSpeed = 25, type = 'hero' }) => {
  if (!choice || !choice.variations || choice.variations.length === 0) return null;
  const variations = choice.variations;

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    draggable: true,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
    slidesToScroll: 1,
    duration: transitionSpeed, 
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setCurrentIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!autoPlay || !emblaApi || variations.length <= 1) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, emblaApi, variations.length]);

  const buildContentStructure = (choice, index) => {
    const variation = choice.variations[index];
    return {
      ...variation.payload.data,
      type: variation.payload.type,
      decisionId: variation.decisionId || choice.decisionId,
      variationId: variation.id
    };
  };

  const formatNumber = (num) => String(num + 1).padStart(2, '0');

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {variations.map((_, index) => (
            <div className={styles.emblaSlide} key={index}>
              <PromoBanner 
                additionalClass={additionalClass}
                content={buildContentStructure(choice, index)} 
                type={type}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Indicators and Counter */}
      <div className={styles.controlsContainer}>
        <div className={styles.indicators}>
          {variations.map((_, index) => (
            <div
              key={index}
              className={`${styles.indicatorLine} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
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
