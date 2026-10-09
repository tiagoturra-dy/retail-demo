import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Groq } from 'groq-sdk';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WebSocket subscriptions by cartId
const cartSubscriptions = new Map();

app.use(express.json());
app.use(express.raw({ type: 'multipart/form-data', limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// DY personalization API 
app.post('/api/choose', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/choose`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/suggest', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/suggest`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/search', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    // Log search request if it has SKU filter
    const hasSkuFilter = bodyData?.query?.filters?.some(f => f.field === 'sku');

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/search`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }
    
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/browse', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/browse`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }
    
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/csSingleContent', async (req, res) => {
  try {
    const { contentType, entryId } = req.body;

    const response = await fetch(
      `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/${entryId}?environment=production`, 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'api_key': process.env.CS_API_KEY,
          'access_token': process.env.CS_ACCESS_TOKEN
        }
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/csMultipleContent', async (req, res) => {
  try {
    const { contentType, entryIdList } = req.body;

    const response = await fetch(
      encodeURI(`https://cdn.contentstack.io/v3/content_types/${contentType}/entries/?environment=production&query={"uid": {"$in" : ["${entryIdList.join('","')}"]}}`), 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'api_key': process.env.CS_API_KEY,
          'access_token': process.env.CS_ACCESS_TOKEN
        }
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/profile', async (req, res) => {
  try {
    const { cuid } = req.body;

    const response = await fetch(`https://dy-api.com/v2/userprofile?cuidType=id&cuid=${cuid}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'dy-api-key': process.env.PROFILE_API_KEY
      }
    });

    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/engage', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct-collect.dy-api.com/v2/collect/user/engagement`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    if (response.ok) {
      // Operation was successful, but there is no body.
      res.status(200).send("Engagements reported successfully."); 
    } else {
      const text = await response.text();
      console.error(`[/api/engage] Upstream error ${response.status}:`, text);
      res.status(response.status).send(text || "Upstream error");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/muse', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/agent-assistant`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }
    
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

// Enhanced Muse V2 endpoint with multi-product selection and cart management
app.post('/api/muse/v2', async (req, res) => {
  try {
    const { bodyData, cartId, selectedProducts } = req.body;
    
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    console.log('[/api/muse/v2] Request with cartId:', cartId);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/agent`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      
      // Enhance response with cart and selection info
      const enhancedData = {
        ...data,
        metadata: {
          version: 'v2',
          cartId,
          selectedProductsCount: selectedProducts?.length || 0,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('[/api/muse/v2] Response sent successfully');
      res.json(enhancedData);
    } else {
      const text = await response.text(); 
      console.error('[/api/muse/v2] DY API error:', response.status, text);
      res.status(response.status).send(text || "No content from API");
    }
    
  } catch (error) {
    console.error('[/api/muse/v2] Error:', error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/event', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);



    const response = await fetch(
      `https://direct-collect.dy-api.com/v2/collect/user/event`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );



    if (response.ok) {
      // Operation was successful, but there is no body.
      res.status(200).send("Engagements reported successfully."); 
    } else {
      const text = await response.text();
      console.error(`[/api/event] Upstream error ${response.status}:`, text);
      res.status(response.status).send(text || "Upstream error");
    }

  } catch (error) {
    console.error('[/api/event] Caught error:', error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/groq', async (req, res) => {
  try {
    const { messages, model } = req.body;
    const groqModel = model || process.env.GROQ_MODEL;

    let payload = {
      messages,
      model: groqModel,
      "temperature": 1,
      "max_completion_tokens": 1024,
      "top_p": 1,
      "stream": true,
      "stop": null
    }

    const groq = new Groq();
    const chatCompletion = await groq.chat.completions.create(payload);

    let content = '';
    for await (const chunk of chatCompletion) {
      content += chunk.choices[0]?.delta?.content || '';
    }

    res.json({ choices: [{ message: { content } }] });
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

// Yoloe image detection API proxy
app.get('/api/detect', async (req, res) => {
  // GET: Health check / warmup (fire-and-forget)
  try {
    const response = await fetch('https://yoloe-api-52467501600.us-central1.run.app/', {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.DY_OBJECT_DETECTOR_KEY
      }
    });
    res.status(response.status).json({ status: 'ok', upstreamStatus: response.status });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/api/detect', async (req, res) => {
  try {
    if (!process.env.DY_OBJECT_DETECTOR_KEY) {
      console.error('[/api/detect] DY_OBJECT_DETECTOR_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const headers = {
      'X-API-Key': process.env.DY_OBJECT_DETECTOR_KEY
    };

    // Preserve incoming Content-Type header (critical for multipart FormData with boundary)
    const contentType = req.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }



    const response = await fetch(
      'https://yoloe-api-52467501600.us-central1.run.app/detect',
      {
        method: 'POST',
        headers,
        body: req.body
      }
    );



    const responseContentType = response.headers.get('content-type');
    if (response.ok && responseContentType && responseContentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      console.error('[/api/detect] Upstream error response:', { status: response.status, text: text.substring(0, 200) });
      res.status(response.status).send(text || 'No content from API');
    }
  } catch (error) {
    console.error('[/api/detect] Error:', error.message);
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

// Health check endpoint for cart management API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Cart API health endpoint
// Cart sync log endpoint (for debugging)
app.get('/api/carts/sync-log', (req, res) => {
  res.json({
    log: cartSyncLog,
    total_carts: Object.keys(cartStore).length,
    carts: Object.entries(cartStore).map(([id, cart]) => ({
      id,
      items: cart.line_items.length,
      total: cart.total_estimate.amount
    }))
  });
});

app.get('/api/carts', (req, res) => {
  res.status(200).json({ health: { status: 'ok' } });
});

// Cart API health endpoint (explicit path)
app.get('/api/carts/health', (req, res) => {
  res.status(200).json({ health: { status: 'ok' } });
});

// In-memory cart store (in production, this would connect to your e-commerce platform)
const cartStore = {};
const cartSyncLog = [];  // Log all cart sync operations

// Merchant business error codes (UCP messages) per Shopping Muse error handling spec
const CART_ERROR_CODES = {
  NOT_FOUND: 'not_found',
  ITEM_UNAVAILABLE: 'item_unavailable',
  OUT_OF_STOCK: 'out_of_stock',
  QUANTITY_LIMIT_EXCEEDED: 'quantity_invalid_limit_exceeded',
  QUANTITY_MINIMUM_NOT_MET: 'quantity_invalid_minimum_not_met',
  ITEM_INELIGIBLE: 'item_ineligible'
};

const MAX_QUANTITY_PER_ITEM = 10;

const buildUcpMessage = (code, content, { type = 'error', severity } = {}) => {
  const message = { type, code, content };
  if (severity) message.severity = severity;
  return message;
};

// Log cart sync operation
const logCartSync = (operation, cartId, details) => {
  const entry = {
    timestamp: new Date().toISOString(),
    operation,  // 'CREATE', 'UPDATE', 'FETCH', 'DELETE'
    cartId,
    ...details
  };
  cartSyncLog.push(entry);
  console.log(`[CART SYNC] ${operation}:`, entry);
};

// Helper function to fetch product details by SKU from DY API
const fetchProductBySku = async (sku) => {
  try {
    const bodyData = {
      user: {
        active_consent_accepted: true,
      },
      context: {
        page: {
          locale: "en_US",
          type: "OTHER",
          data: [""],
          location: "http://localhost:5000"
        },
        device: {
          userAgent: "API Client",
          type: "desktop",
          browser: "other",
          dateTime: new Date().toISOString(),
        },
        channel: 'WEB'
      },
      session: { dy: '' },
      selector: {
        name: "Semantic Search"
      },
      query: {
        enableSpellCheck: false,
        text: "",
        pagination: { "numItems": 1, "offset": 0 },
        filters: [{ field: "sku", values: [sku] }]
      },
      options: {
        returnAnalyticsMetadata: true,
        isImplicitClientData: true,
        isImplicitKeywordSearchEvent: false
      }
    };

    const dataToSend = JSON.stringify(bodyData);

    const response = await fetch(`https://direct.dy-api.com/v2/serve/user/search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'dy-api-key': process.env.DY_API_KEY,
        'Content-Length': Buffer.byteLength(dataToSend)
      },
      body: dataToSend
    });

    if (response.ok) {
      const data = await response.json();
      
      // Navigate nested structure: choices[0].variations[0].payload.data.slots
      const slots = data.choices?.[0]?.variations?.[0]?.payload?.data?.slots;
      
      if (slots && slots.length > 0) {
        const product = slots[0];
        const inventory = product.productData?.['type:number:inventory'];
        return {
          id: product.sku,
          name: product.productData?.name || product.productData?.title || 'Product',
          sku: product.sku,
          price: parseFloat(product.productData?.price) || 0,
          image_url: product.productData?.image_url || product.productData?.imageUrl || '',
          brand: product.productData?.brand || '',
          in_stock: product.productData?.in_stock !== 'FALSE',
          inventory: typeof inventory === 'number' ? inventory : null
        };
      }
    } else {
      const errorText = await response.text();
      console.error(`[fetchProductBySku] Search failed for SKU ${sku}:`, { status: response.status, error: errorText });
    }
    console.warn(`[fetchProductBySku] No product found for SKU: ${sku}`);
    return null;
  } catch (error) {
    console.error(`[fetchProductBySku] Error fetching product for SKU ${sku}:`, error);
    return null;
  }
};

// Helper function to broadcast cart updates to all subscribed clients
const broadcastCartUpdate = (cartId, cart) => {
  const subscribers = cartSubscriptions.get(cartId);
  console.log('[broadcastCartUpdate] Broadcasting to cartId:', cartId, 'subscribers:', subscribers?.size || 0);
  if (subscribers && subscribers.size > 0) {
    const message = JSON.stringify({
      type: 'CART_UPDATE',
      cartId,
      data: cart
    });
    let sentCount = 0;
    subscribers.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
        sentCount++;
      }
    });
    console.log('[broadcastCartUpdate] Sent CART_UPDATE to', sentCount, 'clients');
  } else {
    console.log('[broadcastCartUpdate] No subscribers found for cartId:', cartId);
  }
};

// Get cart endpoint
app.get('/api/carts/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[GET /api/carts/:id] Fetching cart:', id);

    // Retrieve cart from store, or return empty cart if doesn't exist
    const cart = cartStore[id];
    logCartSync('FETCH', id, { found: !!cart, items: cart?.line_items?.length || 0 });

    const messages = [];
    if (!cart) {
      messages.push(buildUcpMessage(
        CART_ERROR_CODES.NOT_FOUND,
        `Cart ${id} does not exist or has expired.`,
        { severity: 'recoverable' }
      ));
    }

    res.json({
      cart_id: id,
      line_items: cart ? cart.line_items : [],
      total_estimate: cart ? cart.total_estimate : { amount: '0.00', currency: 'USD' },
      ...(messages.length ? { messages } : {})
    });
  } catch (error) {
    console.error('[GET /api/carts/:id] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart endpoint - accepts item.id (SKU) and quantity, fetches product details automatically
app.put('/api/carts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { line_items } = req.body;

    console.log('[PUT /api/carts/:id] Request received from:', req.get('origin') || 'unknown', {
      cartId: id,
      lineItemsCount: line_items?.length || 0,
      lineItems: line_items
    });

    if (!line_items || !Array.isArray(line_items)) {
      console.error('[PUT /api/carts/:id] Invalid line_items:', line_items);
      return res.status(400).json({ error: 'Invalid request: line_items must be an array' });
    }

    // Validate line items have item.id and quantity
    for (const item of line_items) {
      if (!item.item?.id || item.quantity === undefined) {
        console.error('[PUT /api/carts/:id] Invalid line item:', item);
        return res.status(400).json({ error: 'Each line item must have item.id (SKU) and quantity' });
      }
    }

    // Get existing cart to merge with new items
    const existingCart = cartStore[id];
    const mergedLineItems = existingCart ? [...existingCart.line_items] : [];
    
    // Process incoming items: add, update, remove, or decrement
    let totalAmount = 0;
    const ucpMessages = [];

    for (let i = 0; i < line_items.length; i++) {
      const item = line_items[i];
      const sku = item.item.id;
      
      // Check if this SKU already exists in cart
      const existingIndex = mergedLineItems.findIndex(li => li.item.id === sku);
      
      // Handle removal: quantity 0 means delete
      if (item.quantity === 0) {
        if (existingIndex >= 0) {
          mergedLineItems.splice(existingIndex, 1);
        }
        continue;
      }
      
      // Handle decrement: negative quantity subtracts from existing
      let finalQuantity = item.quantity;
      if (item.quantity < 0) {
        if (existingIndex >= 0) {
          // Subtract from existing quantity
          finalQuantity = mergedLineItems[existingIndex].quantity + item.quantity;
        } else {
          // Can't decrement non-existent item, skip
          console.warn(`[PUT /api/carts/:id] Cannot decrement non-existent SKU: ${sku}`);
          continue;
        }
      }
      
      // Remove if resulting quantity <= 0
      if (finalQuantity <= 0) {
        if (existingIndex >= 0) {
          mergedLineItems.splice(existingIndex, 1);
        }
        continue;
      }
      
      // Fetch full product details using DY Search API
      const productDetails = await fetchProductBySku(sku);
      
      if (!productDetails) {
        console.warn(`[PUT /api/carts/:id] Could not fetch details for SKU: ${sku}`);
        ucpMessages.push(buildUcpMessage(
          CART_ERROR_CODES.ITEM_UNAVAILABLE,
          `The item ${sku} does not exist or can't currently be purchased.`,
          { severity: 'recoverable' }
        ));
        continue;
      }

      if (productDetails.in_stock === false || productDetails.inventory === 0) {
        ucpMessages.push(buildUcpMessage(
          CART_ERROR_CODES.OUT_OF_STOCK,
          `No inventory is currently available for item ${sku}.`,
          { severity: 'recoverable' }
        ));
        continue;
      }

      // Clamp quantity to the allowed maximum (inventory on hand or the per-item cap)
      const allowedMax = productDetails.inventory !== null
        ? Math.min(productDetails.inventory, MAX_QUANTITY_PER_ITEM)
        : MAX_QUANTITY_PER_ITEM;
      if (finalQuantity > allowedMax) {
        ucpMessages.push(buildUcpMessage(
          CART_ERROR_CODES.QUANTITY_LIMIT_EXCEEDED,
          `The requested quantity for item ${sku} exceeds the allowed maximum of ${allowedMax}.`,
          { severity: 'recoverable' }
        ));
        finalQuantity = allowedMax;
      }

      {
        const itemPrice = productDetails.price;
        const newItem = {
          id: existingIndex >= 0 ? mergedLineItems[existingIndex].id : `line_${Date.now()}_${i}`,
          item: {
            id: productDetails.id,
            sku: productDetails.sku,
            name: productDetails.name,
            image_url: productDetails.image_url,
            brand: productDetails.brand
          },
          quantity: finalQuantity,
          price: { amount: itemPrice.toFixed(2), currency: 'USD' }
        };
        
        if (existingIndex >= 0) {
          mergedLineItems[existingIndex] = newItem;
        } else {
          mergedLineItems.push(newItem);
        }
        totalAmount += itemPrice * finalQuantity;
      }
    }

    // Calculate total including all items in merged cart
    mergedLineItems.forEach(lineItem => {
      // Skip items that were just processed (already counted)
      if (line_items.find(li => li.item.id === lineItem.item.id && li.quantity !== 0)) {
        return;
      }
      const price = parseFloat(lineItem.price.amount);
      totalAmount += price * lineItem.quantity;
    });

    const updatedCart = {
      cart_id: id,
      line_items: mergedLineItems,
      total_estimate: {
        amount: totalAmount.toFixed(2),
        currency: 'USD'
      }
    };

    // Store the updated cart
    cartStore[id] = updatedCart;
    logCartSync('UPDATE', id, { items: mergedLineItems.length, total: updatedCart.total_estimate.amount });

    console.log('[PUT /api/carts/:id] Cart stored, subscribers count:', cartSubscriptions.get(id)?.size || 0);

    // Broadcast update to all subscribed clients
    broadcastCartUpdate(id, updatedCart);

    console.log('[PUT /api/carts/:id] ✅ Response being sent to Muse:', {
      cartId: id,
      itemsCount: mergedLineItems.length,
      itemsDetail: mergedLineItems.map(li => ({
        id: li.id,
        sku: li.item.id,
        quantity: li.quantity,
        price: li.price
      })),
      total: updatedCart.total_estimate.amount,
      currency: updatedCart.total_estimate.currency
    });

    res.json({
      ...updatedCart,
      ...(ucpMessages.length ? { messages: ucpMessages } : {})
    });
  } catch (error) {
    console.error('[PUT /api/carts/:id] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug: Get current subscriptions status
app.get('/api/carts/debug/subscriptions', (req, res) => {
  const subscriptionStatus = {};
  cartSubscriptions.forEach((subscribers, cartId) => {
    subscriptionStatus[cartId] = {
      subscriberCount: subscribers.size,
      hasCart: !!cartStore[cartId]
    };
  });
  
  res.json({
    allCartIds: Array.from(cartSubscriptions.keys()),
    subscriptions: subscriptionStatus,
    totalActiveCartIds: cartSubscriptions.size,
    allCartsInStore: Object.keys(cartStore)
  });
});

// Delete cart endpoint (clear cart data when session ends or user logs out)
app.delete('/api/carts/:id', (req, res) => {
  try {
    const { id } = req.params;

    console.log('[DELETE /api/carts/:id] Clearing cart:', id);

    // Delete cart from store
    if (cartStore[id]) {
      delete cartStore[id];
      logCartSync('DELETE', id, { deleted: true });
    }

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('[DELETE /api/carts/:id] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the Webpack 'dist' folder (Production)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to support React Router
app.get('*', (req, res) => {
  res.status(500).json({ error: "Internal Server Error" });
});

// DY Web Push opt-in
app.post('/api/webpush/opt-in', async (req, res) => {
  try {
    const { dyid, token } = req.body;
    const body = JSON.stringify({
      associatedDevice: { dyid: dyid || '' },
      identifier: { type: 'pushID', value: token },
    });
    const response = await fetch('https://dy-api.com/v2/userdata/channels/web-push/opt-in', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'dy-api-key': process.env.DY_SS_API_KEY,
      },
      body,
    });
    const text = await response.text();
    let data;
    if (!text) {
      data = response.ok ? { success: true } : { error: 'Empty response', status: response.status, statusText: response.statusText };
    } else {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = {
          error: text || 'Failed to parse response',
          status: response.status,
          statusText: response.statusText,
          parseError: parseError.message
        };
      }
    }
    if (!response.ok && !data.error) {
      data = {
        error: 'Server error',
        status: response.status,
        statusText: response.statusText,
        ...data
      };
    }
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[WEBPUSH OPT-IN] Error:', error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

// DY Web Push opt-out
app.post('/api/webpush/opt-out', async (req, res) => {
  try {
    const { dyid, token } = req.body;
    const body = JSON.stringify({
      associatedDevice: { dyid: dyid || '' },
      identifier: { type: 'pushID', value: token },
    });
    const response = await fetch('https://dy-api.com/v2/userdata/channels/web-push/opt-out', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'dy-api-key': process.env.DY_SS_API_KEY,
      },
      body,
    });
    const text = await response.text();
    let data;
    if (!text) {
      data = response.ok ? { success: true } : { error: 'Empty response', status: response.status, statusText: response.statusText };
    } else {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = {
          error: text || 'Failed to parse response',
          status: response.status,
          statusText: response.statusText,
          parseError: parseError.message
        };
      }
    }
    if (!response.ok && !data.error) {
      data = {
        error: 'Server error',
        status: response.status,
        statusText: response.statusText,
        ...data
      };
    }
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

// DY Web Push PN_CLICK engagement
app.post('/api/webpush/pn-click', async (req, res) => {
  try {
    const { tracking } = req.body;

    const body = JSON.stringify({
      type: 'PN_CLICK',
      trackingData: {
        rri: tracking.rri,
        sectionID: tracking.sectionID,
        reqTs: tracking.reqTs,
        userID: tracking.userID,
        version: tracking.version,
        events: tracking.events,
      },
    });
    const response = await fetch('https://direct-collect.dy-api.com/v2/userdata/engagements', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'dy-api-key': process.env.DY_API_KEY,
      },
      body,
    });
    const text = await response.text();
    let data;
    if (!text) {
      data = response.ok ? { success: true } : { error: 'Empty response', status: response.status, statusText: response.statusText };
    } else {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = {
          error: text || 'Failed to parse response',
          status: response.status,
          statusText: response.statusText,
          parseError: parseError.message
        };
      }
    }
    if (!response.ok && !data.error) {
      data = {
        error: 'Server error',
        status: response.status,
        statusText: response.statusText,
        ...data
      };
    }
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

// DY Email opt-in
app.post('/api/email/opt-in', async (req, res) => {
  try {
    const { email, dyid } = req.body;
    const body = JSON.stringify({
      associatedDevice: { dyid: dyid || '' },
      identifier: {
        type: 'email',
        value: email,
      },
    });

    const response = await fetch('https://dy-api.com/v2/userdata/channels/email/opt-in', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'dy-api-key': process.env.DY_SS_API_KEY,
      },
      body,
    });
    const text = await response.text();
    let data;
    if (!text) {
      data = response.ok ? { success: true } : { error: 'Empty response', status: response.status, statusText: response.statusText };
    } else {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = {
          error: text || 'Failed to parse response',
          status: response.status,
          statusText: response.statusText,
          parseError: parseError.message
        };
      }
    }
    if (!response.ok && !data.error) {
      data = {
        error: 'Server error',
        status: response.status,
        statusText: response.statusText,
        ...data
      };
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[EMAIL OPT-IN] Error:', error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

// DY Email opt-out
app.post('/api/email/opt-out', async (req, res) => {
  try {
    const { email, dyid } = req.body;

    const body = JSON.stringify({
      associatedDevice: { dyid: dyid || '' },
      identifier: {
        type: 'email',
        value: email,
      },
    });
    const response = await fetch('https://dy-api.com/v2/userdata/channels/email/opt-out', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'dy-api-key': process.env.DY_SS_API_KEY,
      },
      body,
    });
    const text = await response.text();
    let data;
    if (!text) {
      data = response.ok ? { success: true } : { error: 'Empty response', status: response.status, statusText: response.statusText };
    } else {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = {
          error: text || 'Failed to parse response',
          status: response.status,
          statusText: response.statusText,
          parseError: parseError.message
        };
      }
    }
    if (!response.ok && !data.error) {
      data = {
        error: 'Server error',
        status: response.status,
        statusText: response.statusText,
        ...data
      };
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[EMAIL OPT-OUT] Error:', error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {

    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'SUBSCRIBE') {
          const { cartId } = data;
          console.log('[WebSocket] SUBSCRIBE request for cartId:', cartId);
          console.log('[WebSocket] All current subscriptions:', Array.from(cartSubscriptions.keys()));
          
          if (!cartSubscriptions.has(cartId)) {
            cartSubscriptions.set(cartId, new Set());
            console.log('[WebSocket] Created new subscription set for cartId:', cartId);
          }
          
          cartSubscriptions.get(cartId).add(ws);
          console.log('[WebSocket] ✅ Successfully subscribed. Total subscribers for cartId:', cartSubscriptions.get(cartId).size);

          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'SUBSCRIBED',
            cartId,
            message: 'Successfully subscribed to cart updates'
          }));
        } else if (data.type === 'UNSUBSCRIBE') {
          const { cartId } = data;
          if (cartSubscriptions.has(cartId)) {
            cartSubscriptions.get(cartId).delete(ws);

            
            if (cartSubscriptions.get(cartId).size === 0) {
              cartSubscriptions.delete(cartId);
            }
          }
        }
      } catch (error) {
        console.error('[WebSocket] Error processing message:', error);
      }
    });
    
    ws.on('close', () => {

      // Remove this client from all subscriptions
      cartSubscriptions.forEach((subscribers, cartId) => {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          cartSubscriptions.delete(cartId);
        }
      });
    });
    
    ws.on('error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });
  });
  
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;