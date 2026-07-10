import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ContentClient } from 'dc-delivery-sdk-js';
import { CATEGORIES } from '../../helpers/categoryConstants';
import { Helper } from '../../helpers/helper';
import styles from './CategoriesSection.module.css';

export const CategoriesSection = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [banners, setBanners] = useState({});
  const [loadingBanners, setLoadingBanners] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setHoveredCategory(null);
        setExpandedSections({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!hoveredCategory || !process.env.AMPLIENCE_HUB_NAME) return;
    const category = CATEGORIES.find(c => c.name === hoveredCategory);
    const entryId = category?.banner?.entryId;
    if (!entryId || banners[entryId] || loadingBanners[entryId]) return;

    const client = new ContentClient({
      hubName: process.env.AMPLIENCE_HUB_NAME,
      parameters: { depth: 'all', format: 'inlined' },
    });

    setLoadingBanners(prev => ({ ...prev, [entryId]: true }));
    client.getContentItemById(entryId)
      .then((res) => setBanners(prev => ({ ...prev, [entryId]: res.body })))
      .catch((err) => console.error('Amplience nav banner fetch failed:', err))
      .finally(() => setLoadingBanners(prev => ({ ...prev, [entryId]: false })));
  }, [hoveredCategory]);

  const handleMouseEnter = (categoryName, e) => {
    setHoveredCategory(categoryName);
    const wrapperRect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition(-wrapperRect.left);
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
    setExpandedSections({});
  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.categoriesContainer} ref={containerRef} onMouseLeave={handleMouseLeave}>
      <div className={styles.categoriesInner}>
        {CATEGORIES.map((category) => (
          <div 
            key={category.name}
            className={styles.categoryItemWrapper}
            onMouseEnter={(e) => handleMouseEnter(category.name, e)}
            data-dy-category-menu={category.name}
          >
            <Link 
              to={`/category/${category.name}`}
              className={styles.categoryItem}
              onClick={(e) => {
                if (category.sections?.length && hoveredCategory !== category.name) {
                  e.preventDefault();
                  setHoveredCategory(category.name);
                }
              }}
            >
              <div className={styles.categoryContent}>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {(() => {
        const category = CATEGORIES.find(c => c.name === hoveredCategory);
        if (!category) return null;
        return (
          <div className={styles.subcategoryDropdown}>
            <div className={styles.megaMenuContent}>
              <div className={styles.megaMenuWrapper}>
                <div className={styles.megaMenuGrid}>
                  {category.sections.map((section) => {
                    const sectionKey = `${category.name}-${section.title}`;
                    const isExpanded = !!expandedSections[sectionKey];
                    const visibleItems = isExpanded ? section.items : section.items.slice(0, 5);
                    const hasMore = section.items.length > 5;
                    return (
                      <div key={section.title} className={styles.subcategorySection}>
                        <Link 
                          to={`/category/${category.name}?sub=${section.title}`}
                          className={styles.subcategoryTitle}
                          onClick={() => setHoveredCategory(null)}
                        >
                          {section.title}
                        </Link>
                        <div className={styles.subcategoryItems}>
                          {visibleItems.map((item) => (
                            <Link 
                              key={item}
                              to={`/category/${category.name}?sub=${section.title}&item=${item}`}
                              className={styles.subcategoryItem}
                              onClick={() => setHoveredCategory(null)}
                            >
                              <span>{item}</span>
                              <ArrowRight className={styles.arrow} size="18" />
                            </Link>
                          ))}
                          {hasMore && (
                            <button
                              type="button"
                              className={styles.showMoreBtn}
                              onClick={(e) => { e.stopPropagation(); toggleSection(sectionKey); }}
                            >
                              {isExpanded ? 'Show less' : `+${section.items.length - 5} more`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {category.banner && (() => {
                  const entryId = category.banner.entryId;
                  const bannerData = banners[entryId];
                  const isBannerLoading = loadingBanners[entryId];

                  if (isBannerLoading) {
                    return (
                      <div className={styles.megaMenuFeatured}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.skeletonOffer} />
                      </div>
                    );
                  }

                  if (!bannerData) return null;

                  const bannerImageUrl = Helper.getAmplienceImageUrl(bannerData?.image?.image);
                  const bannerTitle = bannerData?.bannerText?.header;

                  return (
                    <div className={styles.megaMenuFeatured}>
                      <div className={styles.featuredImageContainer}>
                        <img
                          src={bannerImageUrl}
                          alt={bannerTitle}
                          className={styles.featuredImage}
                        />
                        <div className={styles.featuredOverlay} />
                        <div className={styles.featuredText}>
                          <p className={styles.featuredLabel}>{bannerTitle || category.name.toUpperCase()}</p>
                          <p className={styles.featuredTitle}>{`The ${category.name} Edit`}</p>
                        </div>
                      </div>
                      <div className={styles.featuredOffer}>
                        <h4 className={styles.offerHeading}>Exclusive Offer</h4>
                        <p className={styles.offerText}>
                          {`Join our loyalty program and get 15% off your first purchase in the ${category.name} collection.`}
                        </p>
                        <Link to="/login" className={styles.offerLink} onClick={() => setHoveredCategory(null)}>
                          Join Now <ArrowRight className={styles.offerIcon} />
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
