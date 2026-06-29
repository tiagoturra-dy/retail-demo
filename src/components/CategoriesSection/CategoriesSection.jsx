import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../helpers/categoryConstants';
import { useContent } from '../../context/ContentContext';
import styles from './CategoriesSection.module.css';

export const CategoriesSection = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const { banners, loading, fetchBanner } = useContent();
  const containerRef = React.useRef(null);

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
    if (hoveredCategory) {
      const category = CATEGORIES.find(c => c.name === hoveredCategory);
      if (category?.banner) {
        fetchBanner(category.banner.contentType, category.banner.entryId);
      }
    }
  }, [hoveredCategory, fetchBanner]);

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
                  const bannerData = banners[category.banner.entryId];
                  const isBannerLoading = loading[category.banner.entryId];

                  if (isBannerLoading) {
                    return (
                      <div className={styles.megaMenuFeatured}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.skeletonOffer} />
                      </div>
                    );
                  }

                  if (!bannerData) return null;

                  return (
                    <div className={styles.megaMenuFeatured}>
                      <div className={styles.featuredImageContainer}>
                        <img
                          src={bannerData.banner_image?.url}
                          alt={bannerData.caption}
                          className={styles.featuredImage}
                        />
                        <div className={styles.featuredOverlay} />
                        <div className={styles.featuredText}>
                          <p className={styles.featuredLabel}>{bannerData?.caption || category.name.toUpperCase()}</p>
                          <p className={styles.featuredTitle}>{bannerData?.subtitle || `The ${category.name} Edit`}</p>
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
