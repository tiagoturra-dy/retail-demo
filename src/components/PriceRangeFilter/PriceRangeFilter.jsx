import React, { useState, useEffect, useCallback } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from './PriceRangeFilter.module.css';

export const PriceRangeFilter = ({ min, max, selectedRange, onChange }) => {
  const [localRange, setLocalRange] = useState(selectedRange || [min, max]);

  useEffect(() => {
    if (selectedRange) {
      setLocalRange(selectedRange);
    } else {
      setLocalRange([min, max]);
    }
  }, [selectedRange, min, max]);

  const handleSliderChange = (value) => {
    setLocalRange(value);
  };

  const handleSliderAfterChange = (value) => {
    onChange(value);
  };

  const handleInputChange = (index, value) => {
    const newRange = [...localRange];
    const numValue = parseFloat(value) || 0;
    newRange[index] = numValue;
    setLocalRange(newRange);
  };

  const handleInputBlur = () => {
    // Ensure min <= max and within bounds
    let [newMin, newMax] = localRange;
    newMin = Math.max(min, Math.min(newMin, max));
    newMax = Math.max(min, Math.min(newMax, max));
    
    if (newMin > newMax) {
      const temp = newMin;
      newMin = newMax;
      newMax = temp;
    }

    const finalRange = [newMin, newMax];
    setLocalRange(finalRange);
    onChange(finalRange);
  };

  return (
    <div className={styles.priceFilterContainer}>
      <div className={styles.inputsRow}>
        <div className={styles.inputWrapper}>
          <span className={styles.currencySymbol}>$</span>
          <input
            type="number"
            value={localRange[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={handleInputBlur}
            className={styles.priceInput}
            min={min}
            max={max}
          />
        </div>
        <span className={styles.separator}>to</span>
        <div className={styles.inputWrapper}>
          <span className={styles.currencySymbol}>$</span>
          <input
            type="number"
            value={localRange[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={handleInputBlur}
            className={styles.priceInput}
            min={min}
            max={max}
          />
        </div>
      </div>
      
      <div className={styles.sliderWrapper}>
        <Slider
          range
          min={min}
          max={max}
          value={localRange}
          onChange={handleSliderChange}
          onChangeComplete={handleSliderAfterChange}
          styles={{ 
            track: { backgroundColor: '#000' },
            handle: { borderColor: '#000', backgroundColor: '#fff', opacity: 1, boxShadow: 'none' },
            rail: { backgroundColor: '#ddd' }
          }}
        />
      </div>
    </div>
  );
};
