import { PRODUCTS, CATEGORIES } from '../constants';

export const catalogService = {
  getCategories: async () => {
    return CATEGORIES;
  },
  getProducts: async (category?: string, subcategory?: string, priceRanges?: string[]) => {
    let filtered = PRODUCTS.filter(p => {
      const matchesCategory = !category || category === 'all' || p.category.toLowerCase() === category.toLowerCase();
      const matchesSub = !subcategory || p.subcategory.toLowerCase() === subcategory.toLowerCase();
      return matchesCategory && matchesSub;
    });

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

    return filtered;
  },
  getProductById: async (id: string) => {
    return PRODUCTS.find(p => p.id === id) || null;
  }
};
