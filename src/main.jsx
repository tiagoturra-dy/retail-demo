import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { Helper } from './helpers/helper';
import { personalizationService } from './services/personalizationService';

// Initialize DY dyid before any components render to avoid race conditions
const initializeDYid = async () => {
  console.log('[DY Init] Starting DY initialization...');
  
  // Only initialize if dyid doesn't already exist
  const existingDyid = Helper.getStoredValue('_dyid');
  const existingDyidServer = Helper.getStoredValue('_dyid_server');
  
  if (existingDyid || existingDyidServer) {
    console.log('[DY Init] ✓ dyid already exists, skipping initialization', {
      _dyid: existingDyid ? '(set)' : '(empty)',
      _dyid_server: existingDyidServer ? '(set)' : '(empty)'
    });
    return;
  }

  try {
    console.log('[DY Init] Building request body for DY API...');
    const body = await personalizationService.buildBaseBody({ cart: [], isImplicitImpressionMode: false, isImplicitPageview: false });
    // Remove selector - just prime the dyid
    delete body.selector;
    console.log('[DY Init] Request body prepared (selector removed)');
    
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
  // Initialize DY before rendering app
  initializeDYid().then(() => {
    console.log('[Main] DY initialization complete, rendering app...');
    
    // Load DY scripts after dyid is primed
    loadDYScripts();
    
    createRoot(document.getElementById('root')).render(
      // <StrictMode>
        <App />
      // </StrictMode>,
    );
  });
}
