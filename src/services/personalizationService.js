import { Helper } from '../helpers/helper.js'

const buildBaseBody = async ({ cart = [], isImplicitPageview = false, isImplicitImpressionMode = true, type = '' }) => {
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
        returnAnalyticsMetadata: true,
        isImplicitImpressionMode,
        isImplicitClientData: false,
        rejectSession: Helper.isBot(browserData.userAgent),
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

const addPreviewToSelector = (body) => {
  const previewToken = Helper.getDyApiPreviewToken()
  if (previewToken && body.selector) {
    body.selector.preview = {
      ids: [previewToken]
    }
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
  buildBaseBody,
  getRecommendations: async ({ selectors = null, groups = null, cart = [], isImplicitPageview = false }) => {
    console.log('Fetching recommendations for:', selectors, groups)

    let body = await buildBaseBody({ cart, isImplicitPageview })
    if (selectors) body.selector = { names: selectors }
    if (groups) body.selector = { groups }
    addPreviewToSelector(body)
    console.debug('Personazliation Request Body:', body)

    const recs = await getPersonalizationData(body)
    console.log('[Dynamic Yield] getRecommendations response:', recs)

    // set cookies
    recs?.cookies?.forEach((cookie) => {
      if(cookie.name === '_dyid_server') cookie.name = '_dyid'
      Helper.setStoredValue(cookie.name, cookie.value, cookie.maxAge)
    })

    return recs
  },
  trackClick: async ({ decisionId, variationId, slotId, cart = [] }) => {
    if (!slotId && !decisionId) return

    console.log('Tracking click - slotId:', slotId, 'decisionId:', decisionId, 'variationId:', variationId)

    let body = await buildBaseBody({ cart })
    // SLOT_CLICK is required to report product clicks for recommendation/search campaigns
    body.engagements = slotId
      ? [{ type: 'SLOT_CLICK', slotId: String(slotId), ...(variationId != null ? { variations: [Number(variationId)] } : {}) }]
      : [{ type: 'CLICK', decisionId, ...(variationId != null ? { variations: [Number(variationId)] } : {}) }]

    console.log('[Engage] Sending to /api/engage:', JSON.stringify(body));

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

      console.log('[Engage] Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to track engagement')
      }

      if (response.ok) {
        const data = await response.text()
        console.debug('[Engage] Tracked successfully:', data)
        return true
      }
    } catch (error) {
      console.error('[Engage] Error tracking engagement:', error)
    }
  },
  getPersonalizedBanners: async ({ selectors = null, groups = null, cart = [], isImplicitPageview = false } = {}) => {
    console.log('Fetching personalized banners')

    let body = await buildBaseBody({ cart })
    if (selectors) body.selector = { names: selectors }
    if (groups) body.selector = { groups }
    addPreviewToSelector(body)
    console.debug('Banner Request Body:', body)

    const response = await getPersonalizationData(body)
    console.log('[Dynamic Yield] getPersonalizedBanners response:', response)
    // set cookies
    response?.cookies?.forEach((cookie) => {
      if(cookie.name === '_dyid_server') cookie.name = '_dyid'
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
    addPreviewToSelector(body)
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
    data?.cookies?.forEach((cookie) => {
      if(cookie.name === '_dyid_server') cookie.name = '_dyid'
      Helper.setStoredValue(cookie.name, cookie.value, cookie.maxAge)
    })

    const museData = data?.choices?.[0]?.variations?.[0]?.payload?.data

    // handle muse chatId for session persistence
    if (museData && museData.chatId && museData.chatId !== chatId) {
      Helper.setStoredValue(CHAT_ID_KEY, museData.chatId)
    }

    return {
      decisionId: data?.choices?.[0]?.decisionId,
      variationId: data?.choices?.[0]?.variations?.[0]?.id,
      answer: museData?.assistant,
      widgets:
        museData?.widgets?.map((widget) => {
          const decisionId = data?.choices?.[0]?.decisionId;
          const variationId = data?.choices?.[0]?.variations?.[0]?.id;
          const slots = widget.slots.map((s) => ({
            ...s.productData,
            sku: s.sku,
            slotId: s.slotId,
            decisionId,
            variationId,
          }))

          return {
            title: widget.title,
            slots,
          }
        }) || [],
    }
  },
  getMuseResponseV2: async ({ query, cart = [], isImplicitPageview = false, cartId, selectedProducts = [] }) => {
    console.log('Fetching Muse V2 response for:', query)
    const CHAT_ID_KEY = '_dyMuseChatId'
    const chatId = Helper.getStoredValue(CHAT_ID_KEY)

    let body = await buildBaseBody({ cart, isImplicitPageview, type: 'muse' })
    body.query = {
      text: query,
    }
    body.options = { productData: { skusOnly: false } }

    if (chatId && chatId !== '') body.query.chatId = chatId

    if (cartId && cartId !== '') body['commerce'] = {cart_id: cartId}

    body.selector = {
      name: 'Shopping Muse',
    }
    addPreviewToSelector(body)
    console.debug('Muse V2 Request Body:', body)

    const response = await fetch(`/api/muse/v2`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bodyData: JSON.stringify(body), cartId, selectedProducts }),
    })

    const data = await response.json()
    console.debug('DY Muse V2 Results', data)

    // Store chatId if returned in the response
    // set cookies
    data?.cookies?.forEach((cookie) => {
      if(cookie.name === '_dyid_server') cookie.name = '_dyid'
      Helper.setStoredValue(cookie.name, cookie.value, cookie.maxAge)
    })

    const museData = data?.choices?.[0]?.variations?.[0]?.payload?.data

    // handle muse chatId for session persistence
    if (museData && museData.chatId && museData.chatId !== chatId) {
      Helper.setStoredValue(CHAT_ID_KEY, museData.chatId)
    }

    // Extract answer from blocks - collect text and markdown blocks
    let answer = ''
    let blocks = []
    let widgets = []
    
    if (museData?.blocks && Array.isArray(museData.blocks)) {
      // Collect text and markdown content for the answer
      const answerParts = []
      
      museData.blocks.forEach(block => {
        if (block.type === 'text' && block.data) {
          answerParts.push(block.data)
        } else if (block.type === 'markdown' && block.data?.content) {
          answerParts.push(block.data.content)
        }
      })
      
      answer = answerParts.join('\n\n') || ''
      
      // Process all blocks, converting recommendation blocks to widgets format
      blocks = museData.blocks.map(block => {
        const decisionId = data?.choices?.[0]?.decisionId
        const variationId = data?.choices?.[0]?.variations?.[0]?.id
        
        if (block.type === 'recommendation' && block.data) {
          console.log('[Muse V2] Raw recommendation block.data structure:', {
            dataIsArray: Array.isArray(block.data),
            dataLength: block.data.length,
            firstItem: block.data[0],
            allItems: block.data
          });
          
          // Keep each recommendation item separate with its own slots
          const processedItems = block.data.map((item, idx) => {
            console.log(`[Muse V2] Processing item ${idx}:`, {
              title: item.title,
              slotsCount: item.slots?.length || 0,
              slots: item.slots
            });
            
            return {
              ...item,
              slots: (item.slots || []).map(slot => ({
                ...slot.productData,
                sku: slot.sku,
                slotId: slot.slotId,
                decisionId,
                variationId,
              }))
            };
          });
          
          console.log('[Muse V2] Processed items:', {
            itemsCount: processedItems.length,
            items: processedItems
          });
          
          return {
            type: block.type,
            ...block,
            data: processedItems
          }
        }
        
        // Markdown blocks pass through as-is
        if (block.type === 'markdown') {
          return {
            type: block.type,
            ...block
          }
        }
        
        return {
          type: block.type,
          ...block,
        }
      })
      
      // Create widgets from recommendation blocks for backward compatibility
      const recommendationBlocks = blocks.filter(b => b.type === 'recommendation')
      widgets = recommendationBlocks.flatMap(block => 
        (block.data || []).map(item => ({
          title: item.title || 'Recommendations',
          slots: item.slots || []
        }))
      )
    }

    return {
      decisionId: data?.choices?.[0]?.decisionId,
      variationId: data?.choices?.[0]?.variations?.[0]?.id,
      answer: answer || 'I\'m sorry, I couldn\'t find a specific answer for that. How else can I help you?',
      blocks,
      widgets,
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
  trackMuseEvent: async ({ name, properties = {}, cart = [] }) => {
    console.log(`[Dynamic Yield] Triggering Muse event: ${name}`, properties)

    let body = await buildBaseBody({ cart })

    body.events = [
      {
        name,
        properties,
      }
    ]

    console.debug('Muse Event Body:', body)

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
