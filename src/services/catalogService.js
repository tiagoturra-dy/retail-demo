import { PRODUCTS } from '../helpers/productConstants.js';
import { CATEGORIES } from '../helpers/categoryConstants.js'
import { formatMockResponse } from '../helpers/formatMockResponse.js'
import { searchService } from './searchService.js';

export const catalogService = {
  getCategories: async () => {
    return CATEGORIES;
  },
  getProductById: async (id) => {
    const filters = [
      {
        "field": "sku",
        "values": [id]
      }
    ]
    const searchResults = await searchService.searchProducts({
      type: 'product',
      query: '',
      filters,
      numItems: 1,
      isImplicitKeywordSearchEvent: false,
      enableSpellCheck: false,
      contextType: 'OTHER'
    })

    let response = searchResults?.choices?.[0]?.variations?.[0]?.payload?.data?.slots?.[0] || null
    if (response) {
      response = {
        ...response,
        ...response.productData
      }
      delete response.productData
    }
    return response
  },
  getProducts: async (category, subcategory, priceRanges, item) => {
    let filtered = PRODUCTS.filter(p => {
      const matchesCategory = !category || category === 'all' || (p.categories.split('|') || []).some(c => c.toLowerCase().includes(category.toLowerCase()));
      const matchesSub = !subcategory || (p.categories.split('|') || []).some(c => c.toLowerCase().includes(subcategory.toLowerCase()));
      const matchesItem = !item || p.name.toLowerCase().includes(item.toLowerCase());
      return matchesCategory && matchesSub && matchesItem;
    });

    if (priceRanges && priceRanges.length > 0) {
      filtered = filtered.filter(p => {
        return priceRanges.some(range => {
          const price = p.price;
          if (range === 'under-50') return price < 50;
          if (range === '50-100') return price >= 50 && price <= 100;
          if (range === '100-500') return price >= 100 && price <= 500;
          if (range === 'over-500') return price > 500;
          return false;
        });
      });
    }

    return formatMockResponse(filtered, filtered.length);
  },
};
