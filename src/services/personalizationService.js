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

const buildBaseBody = async ({ cart = [], isImplicitPageview = false, contextType }) => {
  const dyid = Helper.getCookie('_dyid')
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
    options: {
      isImplicitPageview,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  }

  if (dyid) {
    body.user['dyid'] = dyid
    body.user['dyid_server'] = dyid
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
    return response
  },
}
