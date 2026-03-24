import { Helper } from '../helpers/helper.js';

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
    session: { dy: '' }
  }

  switch (type) {
    case 'search':
      body.context.page = {
        locale: "en_US",
        type: contextType ?? context.type,
        data: contextType ? [""] : context.data || [""],
        location: window.location.href
      }
      body.options = {
        returnAnalyticsMetadata: false,
        isImplicitClientData: true,
        isImplicitKeywordSearchEvent
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

      const response = await fetch(`/api/suggest`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({bodyData: JSON.stringify(body)}),
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
    if (!query && type === 'search') return mockSearchProducts(query, subcategories, priceRanges, sortBy, filters);
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
        requestBody.query.filters = filters.map(f => {
          // Special handling for price range filter structure
          if (f.field === 'price' && f.values?.[0] && typeof f.values[0] === 'object') {
            return {
              field: 'price',
              min: f.values[0].min,
              max: f.values[0].max
            };
          }
          return f;
        });
      } else if (subcategories && subcategories.length > 0) {
        requestBody.query.filters = [
          {
            field: "categories",
            values: subcategories
          }
        ];
      }

      if (sortBy && sortBy.field !== '') {
        requestBody.query.sortBy = sortBy
      }

      const response = await fetch(`/api/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({bodyData: JSON.stringify(requestBody)})
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

    return null;
  }
};
