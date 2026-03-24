import React, { useCallback, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCard } from '../ProductCard/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './RecsCarousel.module.css';

export const RecsCarousel = ({ recommendations, additionalClass = '' }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: false
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Extract products from recommendations
  const allProducts = useMemo(() => {
    if (!recommendations?.choices) return [];
    return recommendations.choices.flatMap(choice => 
      choice.variations.flatMap(variation => 
        variation.payload.data.slots.map(slot => ({ ...slot, ...slot.productData }))
      )
    );
  }, [recommendations]);

  const title = useMemo(() => {
    return recommendations?.choices?.[0]?.variations?.[0]?.payload.data.custom?.title || 'Recommended for you';
  }, [recommendations]);

  if (allProducts.length === 0) return null;

  return (
    <section className={`${additionalClass} ${styles.recommendationsSection}`}>
      <div className={styles.recommendationsHeader}>
        <h2 className={styles.recommendationsTitle}>{title}</h2>
        <div className={styles.navButtons}>
          <button 
            className={styles.navButton} 
            onClick={scrollPrev}
            aria-label="Previous items"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className={styles.navButton} 
            onClick={scrollNext}
            aria-label="Next items"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        <div className={styles.carouselViewport} ref={emblaRef}>
          <div className={styles.carouselTrack}>
            {allProducts.map((product, index) => (
              <div 
                key={`${product.sku || product.id}-${index}`} 
                className={styles.carouselItem}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
