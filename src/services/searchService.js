import { PRODUCTS } from '../constants.js';

export const searchService = {
  getAutocompleteTerms: async (query) => {
    if (!query) return [];
    const terms = ['T-shirt', 'Dress', 'Watch', 'Bag', 'Jacket', 'Serum', 'Sofa', 'Lamp'];
    return terms.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  },
  searchProducts: async (query, subcategories, priceRanges, sortBy) => {
    if (!query) return [];
    let filtered = PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(query.toLowerCase())
    );

    if (subcategories && subcategories.length > 0) {
      filtered = filtered.filter(p => subcategories.includes(p.subcategory.toLowerCase()));
    }

    if (priceRanges && priceRanges.length > 0) {
      filtered = filtered.filter(p => {
        return priceRanges.some(range => {
          if (range === 'under-50') return p.price < 50;
          if (range === '50-100') return p.price >= 50 && p.price <= 100;
          if (range === '100-500') return p.price >= 100 && p.price <= 500;
          if (range === 'over-500') return p.price > 500;
          return false;
        });
      });
    }

    if (sortBy) {
      if (sortBy === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
      if (sortBy === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name));
      if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }
};
