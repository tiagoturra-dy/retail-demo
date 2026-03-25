import { Helper } from '../helpers/helper.js'

const getPublicIpAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org/?format=json')
    if (!response.ok) {
      throw new Error('Error fetching public IP address')
    }
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Could not get IP address', error)
  }
}

const getBrowserData = async () => {
  const ua = navigator.userAgent;
  
  // 1. Get the UserAgent
  const userAgent = ua;

  // 2. Determine Type (Simplified)
  // We check for "Mobi" which covers most phones and tablets
  const type = /Mobi|Android|iPhone/i.test(ua) ? 'MOBILE' : 'DESKTOP';

  // 3. Get Browser Name (Simple Logic)
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  return {
    userAgent,
    type,
    browser
  };
}

const buildBaseBody = async ({ cart = [], isImplicitPageview = false, type = '' }) => {
  const dyid = Helper.getCookie('_dyid')
  const dyid_server = Helper.getCookie('_dyid_server')
  const dyjsession = Helper.getCookie('_dyjsession')

  const context = Helper.getDYContext(cart)
  const browserData = await getBrowserData()

  let body = {
    user: {
      active_consent_accepted: true,
    },
    context: {
      page: {
        locale: 'en_US',
        type: context.type,
        data: context.data || [''],
        location: window.location.href,
      },
      device: {
        userAgent: browserData.userAgent,
        type: browserData.type,
        browser: browserData.browser,
        ip: await getPublicIpAddress(),
        dateTime: new Date().toISOString(),
      },
      channel: 'WEB',
    },
    session: { dy: '' },
  }

  switch (type) {
    case 'muse':
      body['options'] = {
        returnAnalyticsMetadata: false,
        isImplicitClientData: false,
        isImplicitKeywordSearchEvent: false
      }
      break;
  
    default:
      body['options'] = {
        isImplicitPageview,
        returnAnalyticsMetadata: false,
        isImplicitImpressionMode: true,
        isImplicitClientData: false,
      }
      break;
  }

  if (dyid) {
    body.user['dyid'] = dyid
  }
  if (dyid_server) {
    body.user['dyid_server'] = dyid_server
  }
  if (dyjsession) {
    body.session.dy = dyjsession
  }

  return body
}

const getPersonalizationData = async (body) => {
  const response = await fetch(`/api/choose`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({bodyData: JSON.stringify(body)}),
  })

  const data = await response.json()
  console.debug('DY Personalization Results', data)
  return data
}

export const personalizationService = {
  getRecommendations: async ({ selectors = null, groups = null, cart = [], isImplicitPageview = false }) => {
    console.log('Fetching recommendations for:', selectors, groups)

    let body = await buildBaseBody({ cart, isImplicitPageview })
    if (selectors) 
      body.selector = { names: selectors }
    if (groups)
      body.selector = { groups }
    console.debug('Personazliation Request Body:', body)

    const recs = await getPersonalizationData(body)

    // set cookies
    recs?.cookes?.array.forEach(cookie => {
      Helper.setCookie(cookie.name, cookie.value, cookie.maxAge);
    });
    
    return recs
  },
  trackClick: async ({ decisionId, variationId, cart = [] }) => {
    if (!decisionId || !variationId) return;

    console.log('Tracking click for decisionId:', decisionId, variationId);

    let body = await buildBaseBody({ cart });
    body.engagements = [{ 
      type: 'CLICK',
      decisionId,
      variations: [variationId]
    }];

    try {
      const response = await fetch(`/api/engage`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({bodyData: JSON.stringify(body)}),
      })

      if (!response.ok) {
        throw new Error('Failed to track engagement');
      }

      if (response.status === 204) {
        const data = await response.text();
        console.debug('Engagement Tracked', data);
        return true
      }

    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  },
  getPersonalizedBanners: async ({ selectors = null, groups = null, cart = [], isImplicitPageview = false } = {}) => {
    console.log('Fetching personalized banners');

    let body = await buildBaseBody({ cart });
    if (selectors) 
      body.selector = { names: selectors }
    if (groups)
      body.selector = { groups }
    console.debug('Banner Request Body:', body);

    const response = await getPersonalizationData(body);
    // set cookies
    response?.cookes?.array.forEach(cookie => {
      Helper.setCookie(cookie.name, cookie.value, cookie.maxAge);
    });

    return response
  },
  getMuseResponse: async ({ query, cart = [], isImplicitPageview = false }) => {
    console.log('Fetching Muse response for:', query);
    const CHAT_ID_KEY = '_dyMuseChatId'
    const chatId = Helper.getCookie(CHAT_ID_KEY);

    let body = await buildBaseBody({ cart, isImplicitPageview, type: 'muse' });
    body.query = {
      text: query
    };
    
    if (chatId && chatId !== '')
      body.query.chatId = chatId

    body.selector = {
      "name": "Shopping Muse"
    }
    console.debug('Muse Request Body:', body);

    const response = await fetch(`/api/muse`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({bodyData: JSON.stringify(body)}),
    });

    const data = await response.json();
    console.debug('DY Muse Results', data);

    // Store chatId if returned in the response
    // set cookies
    data?.cookes?.array.forEach(cookie => {
      Helper.setCookie(cookie.name, cookie.value, cookie.maxAge);
    });

    const museData = data?.choices?.[0]?.variations?.[0]?.payload?.data;

    // handle muse chatId for session persistence
    if (museData && museData.chatId && museData.chatId !== chatId) {
      Helper.setCookie(CHAT_ID_KEY, museData.chatId);
    }

    return {
      decisionId: data?.choices?.[0]?.decisionId,
      variationId: data?.choices?.[0]?.variations?.[0].id,
      answer: museData?.assistant,
      widgets: museData?.widgets.map(widget => {
        const slots = widget.slots.map(s => ({
          ...s.productData,
          sku: s.sku,
          slotId: s.slotId
        }))

        return {
          title: widget.title,
          slots
        }
      }) || []
    };
  },
}
