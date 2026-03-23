import { Helper } from '../helpers/helper.js'
import { PRODUCTS } from '../helpers/productConstants.js'

const DY_API_KEY = '02ea0c7c5ba6b60abf1e02a1b7317f62b53a07ed34a2fc09c05f1c9b128a03ab';

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
  const browserData = getBrowserData()

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
  const response = await fetch('https://direct.dy-api.com/v2/serve/user/choose', {
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
  console.debug('DY Personalization Results', data)
  return data
}

export const personalizationService = {
  getRecommendations: async ({ selectors = [''], cart = [], isImplicitPageview = false }) => {
    console.log('Fetching recommendations for:', selectors)

    let body = await buildBaseBody({ cart, isImplicitPageview })
    body.selector = { names: selectors }
    console.debug('Personazliation Request Body:', body)

    const recs = await getPersonalizationData(body)
    // Return a subset of products as recommendations
    return PRODUCTS.slice(0, 4)
  },
  getPersonalizedBanners: async () => {
    return [
      {
        id: 'banner-1',
        title: 'Exclusive Offer for You',
        subtitle: 'Get 20% off your next purchase',
        image: 'https://picsum.photos/seed/promo/1200/400',
      },
    ]
  },
}
