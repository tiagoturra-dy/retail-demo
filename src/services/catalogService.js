import { CATEGORIES } from '../helpers/categoryConstants.js'
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
};
