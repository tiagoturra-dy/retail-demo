import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CustomSelect.module.css';

export const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  icon: Icon, 
  label, 
  variant = 'default',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`${styles.selectContainer} ${className}`} ref={dropdownRef}>
      {label && <span className={styles.label}>{label}</span>}
      
      <button 
        type="button"
        className={`${styles.selectButton} ${styles[variant]}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {Icon && <Icon className={styles.icon} size={16} />}
        <span className={styles.valueText}>{selectedOption.label}</span>
        <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>
      
      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {options.map((option) => (
            <li 
              key={option.value} 
              role="option"
              aria-selected={value === option.value}
              className={`${styles.option} ${value === option.value ? styles.optionSelected : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
