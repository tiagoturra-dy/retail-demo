import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCY_OPTIONS } from '../helpers/currencyConstants';

const CurrencyContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'dyRetailDemoCurrency'
const DEFAULT_LANG = 'en-US';

export const CurrencyProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return CURRENCY_OPTIONS.some(o => o.lang === saved) ? saved : DEFAULT_LANG;
  });

  const currencyOption = CURRENCY_OPTIONS.find(o => o.lang === lang) || CURRENCY_OPTIONS[0];
  const currency = currencyOption.value; // ISO 4217 code e.g. "USD"

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    window.getCurrencySymbol = () => currency; // Expose a global function for testing purposes
    window.__formatPrice = (price) => formatPrice(price);
  }, [lang, currency]);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    
    let numericPrice = price;
    if (typeof price === 'string') {
      // Extract numeric value from string (handles cases where price might already have a symbol)
      numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    }
    
    if (isNaN(numericPrice)) return String(price);
    
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: currency,
    }).format(numericPrice);
  };

  return (
    <CurrencyContext.Provider value={{ currency, lang, setCurrency: setLang, formatPrice }}>
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