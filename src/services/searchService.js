import { PRODUCTS } from '../helpers/productConstants.js';
import { formatMockResponse } from '../helpers/formatMockResponse.js'
import { Helper } from '../helpers/helper.js';

const DY_API_KEY = '02ea0c7c5ba6b60abf1e02a1b7317f62b53a07ed34a2fc09c05f1c9b128a03ab';
// const DY_API_KEY = 'a864b4b17b0110f5c0de0a7c38a5428582a3faf21e45090e2da96c3bffb90465';

const mockSearchProducts = async (query, subcategories, priceRanges, sortBy) => {
  if (!query) return formatMockResponse([], 0);
  let filtered = PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    (p.categories.split('|') || []).some(c => c.toLowerCase().includes(query.toLowerCase())) ||
    (p.description || '').toLowerCase().includes(query.toLowerCase())
  );

  if (subcategories && subcategories.length > 0) {
    filtered = filtered.filter(p => 
      (p.categories.split('|')  || []).some(c => subcategories.includes(c.toLowerCase()))
    );
  }

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

  if (sortBy) {
    if (sortBy === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  }

  return formatMockResponse(filtered, filtered.length);
};

const mockSuggestions = async (query) => {
  if (!query) return [];
  const terms = ['T-shirt', 'Dress', 'Watch', 'Bag', 'Jacket', 'Serum', 'Sofa', 'Lamp'];
  return terms.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
}

const buildBaseBody = ({type = 'search', cart = [], isImplicitKeywordSearchEvent = true, contextType}) => {
  const dyid = Helper.getCookie('_dyid');
  const dyjsession = Helper.getCookie('_dyjsession');

  const context = Helper.getDYContext(cart);

  let body = {
    user: {
      active_consent_accepted: true,
    },
    context: {
      page: {}
    },
    session: { dy: '' },
    options: {
      returnAnalyticsMetadata: false,
      isImplicitClientData: true,
      isImplicitKeywordSearchEvent
    }
  }

  switch (type) {
    case 'search':
      body.context.page = {
        locale: "en_US",
        type: contextType ?? context.type,
        data: contextType ? [""] : context.data || [""],
        location: window.location.href
      }
      break
  
    case 'suggestion':
      body.context.page = {
        locale: "en_US"
      }
      break
  }

  if (dyid) {
    body.user['dyid'] = dyid;
    body.user['dyid_server'] = dyid;
  }
  if (dyjsession) {
    body.session.dy = dyjsession;
  }
  
  return body
}

export const searchService = {
  getTermsSuggestions: async ({text, numItems = 10}) => {
    // Dynamic Yield Suggestions API Call
    try {
      let results = []
      const body = {
        ...buildBaseBody({type: 'suggestion'}),
        query: {
          text,
          suggestions: [
            {
              type: 'querySuggestions',
              maxResults: numItems,
            },
          ],
        },
      }
  
      const response = await fetch('https://direct.dy-api.com/v2/serve/user/suggest', {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          'dy-api-key': DY_API_KEY,
        },
        body: JSON.stringify(body),
        method: 'POST',
        credentials: 'omit',
      })

      const data = await response.json()
      results = data?.variations?.[0]?.payload?.data?.suggestions?.querySuggestions ?? []
      console.debug('DY Search Suggestion Results', results)

      return results
    } catch (error) {
      console.error('DY Suggestions API Error:', error);
    }

    return mockSuggestions()
  },
  searchProducts: async ({
    query, 
    subcategories, 
    priceRanges, 
    sortBy, 
    filters,
    cart = [], 
    numItems = 48, 
    offset = 0, 
    type = "search",
    isImplicitKeywordSearchEvent = true,
    enableSpellCheck = true,
    contextType = null
  }) => {
    if (!query && type === 'search') return mockSearchProducts(query, subcategories, priceRanges, sortBy);
    const dyid = Helper.getCookie('_dyid');
    const dyjsession = Helper.getCookie('_dyjsession');

    // Dynamic Yield Search API Call
    try {
      const requestBody = {
        ...buildBaseBody({cart, isImplicitKeywordSearchEvent, contextType}),
        selector: {
          name: "Semantic Search"
        },
        query: {
          enableSpellCheck,
          text: query,
          pagination: { "numItems": numItems, "offset": offset }
        }
      };

      if (filters && filters.length > 0) {
        requestBody.query.filters = filters;
      }

      const response = await fetch('https://direct.dy-api.com/v2/serve/user/search', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'dy-api-key': DY_API_KEY
        },
        body: JSON.stringify(requestBody),
        credentials: 'omit',
      });

      if (response.ok) {
        const data = await response.json();
        
        const dyidFromResponse = data.cookies.filter(cookie => cookie.name === '_dyid_server')[0];
        const dySessionFromResponse = data.cookies.filter(cookie => cookie.name === '_dyjsession')[0];
        
        if (dyidFromResponse && !dyid) {
          Helper.setCookie(
            '_dyid', 
            dyidFromResponse.value, 
            dyidFromResponse.maxAge ? dyidFromResponse.maxAge / (60 * 60 * 24) : 365
          );
        }
        if (dySessionFromResponse && !dyjsession) {
          Helper.setCookie(
            '_dyjsession', 
            dySessionFromResponse.value, 
            dySessionFromResponse.maxAge ? dySessionFromResponse.maxAge / (60 * 60 * 24) : 365
          );
        }

        console.log('DY Search Response:', data);
        data.engine = "Mastercard Dynamic Yield"
        return data;
      }
    } catch (error) {
      console.error('DY Search API Error:', error);
    }

    return mockSearchProducts(query, subcategories, priceRanges, sortBy);
  }
};
