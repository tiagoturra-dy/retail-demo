import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { Helper } from './helpers/helper';
import { personalizationService } from './services/personalizationService';
import nanoid from 'nano-id';

const getRuntimeConfig = (response) => {
  const config = response?.choices?.[0]?.variations?.[0]?.payload?.data;
  return config?.schemaVersion === 1 ? config : null;
};

window.__getConfiguration = () => window.__dyRuntimeConfig || null;

const getCartApiBaseUrl = () => (
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'
);

// Create the server cart before React renders, so external Muse calls can use it immediately.
const initializeCart = async () => {
  const existingCartId = localStorage.getItem('retail_cart_id');
  const cartId = existingCartId || nanoid();

  localStorage.setItem('retail_cart_id', cartId);
  sessionStorage.setItem('cart_id', cartId);

  console.log('[Cart Init] Initializing cart', {
    cartId,
    reused: !!existingCartId
  });

  const response = await fetch(`${getCartApiBaseUrl()}/api/carts/${cartId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_CART_API_KEY || ''
    },
    body: JSON.stringify({ line_items: [] })
  });

  if (!response.ok) {
    throw new Error(`Cart API returned status ${response.status}`);
  }

  console.log('[Cart Init] Cart ready', { cartId });
  return cartId;
};

// Initialize DY dyid before any components render to avoid race conditions
const initializeDYid = async () => {
  console.log('[DY Init] Starting DY initialization...');
  
  // Keep existing DY identity, but fetch the runtime config on every refresh.
  const existingDyid = Helper.getStoredValue('_dyid');
  const existingDyidServer = Helper.getStoredValue('_dyid_server');

  try {
    console.log('[DY Init] Existing DY identity', {
      _dyid: existingDyid ? '(set)' : '(empty)',
      _dyid_server: existingDyidServer ? '(set)' : '(empty)'
    });
    console.log('[DY Init] Building request body for DY API...');
    const body = await personalizationService.buildBaseBody({ cart: [], isImplicitImpressionMode: false, isImplicitPageview: false });
    
    // get initial site config
    body.selector = { names: ['BlueberryConfig'] };
    body.options = {
      isImplicitPageview: false,
      isImplicitImpressionMode: false,
      isImplicitClientData: false,
      returnAnalyticsMetadata: false,
    };
    
    console.log('[DY Init] Request body prepared with runtime config selector');
    
    console.log('[DY Init] Sending prime request to /api/choose...');
    const response = await fetch(`/api/choose`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bodyData: JSON.stringify(body) }),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const runtimeConfig = getRuntimeConfig(data);
    if (runtimeConfig) {
      window.__dyRuntimeConfig = runtimeConfig;
      console.log('[DY Init] Runtime config loaded', { schemaVersion: runtimeConfig.schemaVersion });
    } else {
      console.warn('[DY Init] No valid runtime config received; using app defaults');
    }
    console.log('[DY Init] Received response from DY API', {
      cookieCount: data?.cookies?.length || 0,
      hasChoices: !!data?.choices
    });
    
    // Handle cookies to set dyid
    if (data?.cookies && data.cookies.length > 0) {
      console.log('[DY Init] Processing cookies...');
      data.cookies.forEach((cookie) => {
        const cookieName = cookie.name === '_dyid_server' ? '_dyid' : cookie.name;
        Helper.setStoredValue(cookieName, cookie.value, cookie.maxAge);
        console.log(`[DY Init]   ✓ Stored cookie: ${cookieName} (expires in ${cookie.maxAge || 'session'})`);
      });
    } else {
      console.warn('[DY Init] No cookies received in response');
    }

    const finalDyid = Helper.getStoredValue('_dyid');
    console.log('[DY Init] ✅ Initialization complete', {
      dyidStored: !!finalDyid,
      dyidValue: finalDyid ? finalDyid.substring(0, 8) + '...' : '(not set)'
    });
  } catch (error) {
    console.error('[DY Init] ❌ Error during initialization', {
      message: error.message,
      stack: error.stack
    });
  }
};

// Fire-and-forget request to object detection API
const initializeObjectDetector = () => {
  fetch('/api/detect', {
    method: 'GET'
  }).catch(error => {
    console.error('[Object Detector] Initialization request failed:', error.message);
  });
};

// Load DY scripts after dyid initialization
const loadDYScripts = () => {
  console.log('[DY Scripts] Loading Dynamic Yield scripts...');
  
  // Load api_dynamic.js
  const dynamicScript = document.createElement('script');
  dynamicScript.type = 'text/javascript';
  dynamicScript.src = 'https://cdn.dynamicyield.com/api/8794611/api_dynamic.js';
  dynamicScript.async = true;
  dynamicScript.onload = () => console.log('[DY Scripts] ✓ api_dynamic.js loaded');
  dynamicScript.onerror = () => console.error('[DY Scripts] ❌ Failed to load api_dynamic.js');
  document.head.appendChild(dynamicScript);
  
  // Load api_static.js
  const staticScript = document.createElement('script');
  staticScript.type = 'text/javascript';
  staticScript.src = 'https://cdn.dynamicyield.com/api/8794611/api_static.js';
  staticScript.async = true;
  staticScript.onload = () => console.log('[DY Scripts] ✓ api_static.js loaded');
  staticScript.onerror = () => console.error('[DY Scripts] ❌ Failed to load api_static.js');
  document.head.appendChild(staticScript);
};

if (!Helper.isBot(navigator.userAgent)) {
  // Initialize DY identity and server cart before rendering the app.
  Promise.all([initializeDYid(), initializeCart()]).then(() => {
    console.log('[Main] Initialization complete, rendering app...');
    
    // Load DY scripts after dyid is primed
    loadDYScripts();
    
    // Fire-and-forget object detector initialization
    // initializeObjectDetector();
    
    createRoot(document.getElementById('root')).render(
      // <StrictMode>
        <App />
      // </StrictMode>,
    );
    }).catch((error) => {
      console.error('[Main] Initialization failed:', error);
  });
}
