import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'dyRetailDemoCurrency'

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedCurrency || '$';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, currency);
    window.getCurrencySymbol = () => currency; // Expose a global function for testing purposes
  }, [currency]);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    
    let numericPrice = price;
    if (typeof price === 'string') {
      // Extract numeric value from string (handles cases where price might already have a symbol)
      numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    }
    
    if (isNaN(numericPrice)) return String(price);
    
    return `${currency}${numericPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};