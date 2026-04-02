import { Helper } from '../helpers/helper.js'

const buildBaseBody = async ({ cart = [], isImplicitPageview = false, type = '' }) => {
  const dyid = Helper.getStoredValue('_dyid')
  const dyid_server = Helper.getStoredValue('_dyid_server')
  const dyjsession = Helper.getStoredValue('_dyjsession')

  const context = Helper.getDYContext(cart)
  const browserData = await Helper.getBrowserData()

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
        ip: await Helper.getPublicIpAddress(),
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
        isImplicitKeywordSearchEvent: false,
      }
      break

    default:
      body['options'] = {
        isImplicitPageview,
        returnAnalyticsMetadata: false,
        isImplicitImpressionMode: true,
        isImplicitClientData: false,
      }
      break
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
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bodyData: JSON.stringify(body) }),
  })

  const data = await response.json()
  console.debug('DY Personalization Results', data)
  return data
}

export const personalizationService = {
  getRecommendations: async ({ selectors = null, groups = null, cart = [], isImplicitPageview = false }) => {
    console.log('Fetching recommendations for:', selectors, groups)

    let body = await buildBaseBody({ cart, isImplicitPageview })
    if (selectors) body.selector = { names: selectors }
    if (groups) body.selector = { groups }
    console.debug('Personazliation Request Body:', body)

    const recs = await getPersonalizationData(body)

    // set cookies
    recs?.cookes?.array.forEach((cookie) => {
      Helper.setStoredValue(cookie.name, cookie.value, cookie.maxAge)
    })

    return recs
  },
  trackClick: async ({ decisionId, variationId, cart = [] }) => {
    if (!decisionId || !variationId) return

    console.log('Tracking click for decisionId:', decisionId, variationId)

    let body = await buildBaseBody({ cart })
    body.engagements = [
      {
        type: 'CLICK',
        decisionId,
        variations: [variationId],
      },
    ]

    try {
      const response = await fetch(`/api/engage`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bodyData: JSON.stringify(body) }),
      })

      if (!response.ok) {
        throw new Error('Failed to track engagement')
      }

      if (response.ok) {
        const data = await response.text()
        console.debug('Engagement Tracked', data)
        return true
      }
    } catch (error) {
      console.error('Error tracking engagement:', error)
    }
  },
  getPersonalizedBanners: async ({ selectors = null, groups = null, cart = [], isImplicitPageview = false } = {}) => {
    console.log('Fetching personalized banners')

    let body = await buildBaseBody({ cart })
    if (selectors) body.selector = { names: selectors }
    if (groups) body.selector = { groups }
    console.debug('Banner Request Body:', body)

    const response = await getPersonalizationData(body)
    // set cookies
    response?.cookes?.array.forEach((cookie) => {
      Helper.setStoredValue(cookie.name, cookie.value, cookie.maxAge)
    })

    return response
  },
  getMuseResponse: async ({ query, cart = [], isImplicitPageview = false }) => {
    console.log('Fetching Muse response for:', query)
    const CHAT_ID_KEY = '_dyMuseChatId'
    const chatId = Helper.getStoredValue(CHAT_ID_KEY)

    let body = await buildBaseBody({ cart, isImplicitPageview, type: 'muse' })
    body.query = {
      text: query,
    }

    if (chatId && chatId !== '') body.query.chatId = chatId

    body.selector = {
      name: 'Shopping Muse',
    }
    console.debug('Muse Request Body:', body)

    const response = await fetch(`/api/muse`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bodyData: JSON.stringify(body) }),
    })

    const data = await response.json()
    console.debug('DY Muse Results', data)

    // Store chatId if returned in the response
    // set cookies
    data?.cookes?.array.forEach((cookie) => {
      Helper.setStoredValue(cookie.name, cookie.value, cookie.maxAge)
    })

    const museData = data?.choices?.[0]?.variations?.[0]?.payload?.data

    // handle muse chatId for session persistence
    if (museData && museData.chatId && museData.chatId !== chatId) {
      Helper.setStoredValue(CHAT_ID_KEY, museData.chatId)
    }

    return {
      decisionId: data?.choices?.[0]?.decisionId,
      variationId: data?.choices?.[0]?.variations?.[0].id,
      answer: museData?.assistant,
      widgets:
        museData?.widgets.map((widget) => {
          const slots = widget.slots.map((s) => ({
            ...s.productData,
            sku: s.sku,
            slotId: s.slotId,
          }))

          return {
            title: widget.title,
            slots,
          }
        }) || [],
    }
  },
  trackPurchase: async ({ orderId, total, cart = [] }) => {
    console.log('[Dynamic Yield] Triggering PURCHASE event for order:', orderId)

    let body = await buildBaseBody({cart: []})

    body.events = [
      {
        "name": "Purchase",
        "properties": {
          "dyType": "purchase-v1",
          "value": total,
          "currency": "USD",
          "uniqueTransactionId": orderId,
          "cart": cart.map(item => ({
            productId: String(item.id),
            quantity: item.quantity,
            itemPrice: Number(item.price)
          }))
        }
      }
    ]

    console.debug('Purchase Event Body:', body)

    const response = await fetch(`/api/event`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bodyData: JSON.stringify(body) }),
    })

    if (response.ok) {
      return { success: true } 
    }

    return { success: false }
  },
}
