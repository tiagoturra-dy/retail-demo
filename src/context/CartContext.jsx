import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import nanoid from 'nano-id';
import { Helper } from '../helpers/helper';
import { useCartWebSocket } from '../hooks/useCartWebSocket';

const CartContext = createContext(undefined);

// Get API base URL (backend server, not React dev server)
const getApiBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // In production, API is on same host/port (proxied or deployed together)
    return '';
  } else {
    // In development, API is on backend server port 5000
    return 'http://localhost:5000';
  }
};

export const CartProvider = ({ children }) => {
  // Configurable shipping constants
  const SHIPPING_THRESHOLD = Helper.getFreeShippingThreshold();
  const FLAT_SHIPPING_FEE = Helper.getShippingValue();

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('retail_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [lastAdded, setLastAdded] = useState(null);
  const [cartId, setCartId] = useState(() => {
    const savedCartId = localStorage.getItem('retail_cart_id');
    return savedCartId || nanoid();
  });

  // Track if cart update came from WebSocket or server sync to prevent sync loops
  const isWebSocketUpdateRef = useRef(false);
  const isServerSyncRef = useRef(false);

  const clearCartId = () => {
    clearCartFromServer(cartId);
    const newCartId = nanoid();
    setCartId(newCartId);
    localStorage.setItem('retail_cart_id', newCartId);
    sessionStorage.setItem('cart_id', newCartId);
  };

  const syncCartToApi = async (cartItems = cart, currentCartId = cartId) => {
    try {
      // Always send current cart state - empty array means empty cart, non-empty has all items
      const lineItems = cartItems.map((item) => ({
        item: {
          id: String(item.id)
        },
        quantity: item.quantity
      }));

      const response = await fetch(`${getApiBaseUrl()}/api/carts/${currentCartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_CART_API_KEY || ''
        },
        body: JSON.stringify({ line_items: lineItems })
      });

      if (!response.ok) {
        console.error('[syncCartToApi] Failed to sync cart:', response.status);
        return null;
      }

      const syncedCart = await response.json();
      console.log('[syncCartToApi] Cart synced successfully:', syncedCart);
      return syncedCart;
    } catch (error) {
      console.error('[syncCartToApi] Error syncing cart:', error);
      return null;
    }
  };

  const clearCartFromServer = async (currentCartId = cartId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/carts/${currentCartId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_CART_API_KEY || ''
        }
      });

      if (!response.ok) {
        console.error('[clearCartFromServer] Failed to clear cart:', response.status);
        return null;
      }

      const result = await response.json();
      console.log('[clearCartFromServer] Cart cleared successfully:', result);
      return result;
    } catch (error) {
      console.error('[clearCartFromServer] Error clearing cart:', error);
      return null;
    }
  };

  const syncCartFromServer = async (currentCartId = cartId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/carts/${currentCartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_CART_API_KEY || ''
        }
      });

      if (!response.ok) {
        console.error('[syncCartFromServer] Failed to fetch cart:', response.status);
        return null;
      }

      const serverCart = await response.json();
      console.log('[syncCartFromServer] Cart fetched from server:', serverCart);

      // Merge server cart into client state
      if (serverCart.line_items && Array.isArray(serverCart.line_items)) {
        const mergedCart = serverCart.line_items.map(lineItem => ({
          id: lineItem.item.id,
          quantity: lineItem.quantity,
          price: parseFloat(lineItem.price.amount),
          name: lineItem.item.name || 'Product',
          image_url: lineItem.item.image_url || '',
          brand: lineItem.item.brand || ''
        }));
        // Mark as server sync to prevent auto-syncing back to API
        isServerSyncRef.current = true;
        setCart(mergedCart);
      }

      return serverCart;
    } catch (error) {
      console.error('[syncCartFromServer] Error fetching cart:', error);
      return null;
    }
  };

  useEffect(() => {
    localStorage.setItem('retail_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('retail_cart_id', cartId);
    sessionStorage.setItem('cart_id', cartId);
  }, [cartId]);

  useEffect(() => {
    // Auto-sync cart to API when cart changes (but NOT from WebSocket or server sync updates)
    if (!isWebSocketUpdateRef.current && !isServerSyncRef.current) {
      syncCartToApi(cart, cartId);
    }
    // Reset flags after check
    isWebSocketUpdateRef.current = false;
    isServerSyncRef.current = false;
  }, [cart, cartId]);

  useEffect(() => {
    // Sync cart from server on mount (in case external systems updated it)
    syncCartFromServer(cartId);
  }, [cartId]);

  useEffect(() => {
    // Listen for cart updates from other tabs via localStorage
    const handleStorageChange = (e) => {
      // Only handle cart-related storage changes
      if (e.key === 'retail_cart' && e.newValue) {
        try {
          const updatedCart = JSON.parse(e.newValue);
          console.log('[CartContext] Cart synced from another tab:', updatedCart);
          setCart(updatedCart);
        } catch (error) {
          console.error('[CartContext] Error parsing cart from storage:', error);
        }
      }
      
      if (e.key === 'retail_cart_id' && e.newValue) {
        console.log('[CartContext] CartId synced from another tab:', e.newValue);
        setCartId(e.newValue);
      }
    };

    // Listen for storage changes from OTHER tabs
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle WebSocket cart updates
  const handleWebSocketCartUpdate = (serverCart) => {
    if (serverCart.line_items && Array.isArray(serverCart.line_items)) {
      const mergedCart = serverCart.line_items.map(lineItem => ({
        id: lineItem.item.id,
        quantity: lineItem.quantity,
        price: parseFloat(lineItem.price.amount),
        name: lineItem.item.name || 'Product',
        image_url: lineItem.item.image_url || '',
        brand: lineItem.item.brand || ''
      }));
      // Mark this as a WebSocket update to prevent sync loop
      isWebSocketUpdateRef.current = true;
      setCart(mergedCart);
      console.log('[CartContext] Cart updated via WebSocket:', mergedCart);
    }
  };

  // Setup WebSocket connection
  useCartWebSocket(cartId, handleWebSocketCartUpdate);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity }];
      }

      setLastAdded(product);

      // Trigger Dynamic Yield Event
      if (window.DY && typeof window.DY.API === 'function') {
        window.DY.API("event", {
          name: "Add to Cart",
          properties: {
            dyType: "add-to-cart-v1",
            value: product.price,
            currency: "USD",
            productId: String(product.id),
            quantity: quantity,
            cart: newCart.map(item => ({
              productId: String(item.id),
              quantity: item.quantity,
              itemPrice: item.price
            }))
          }
        });
        console.log('[Dynamic Yield] Add to Cart event triggered for product:', product.id);
      }

      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    // Send quantity: -1 (server will decrement, remove if result <= 0)
    setCart((prev) => {
      const updated = prev.map((item) => 
        item.id === productId ? { ...item, quantity: -1 } : item
      );
      // Schedule cleanup of qty 0 items after sync response
      const cleanup = setTimeout(() => {
        setCart((current) => current.filter((item) => item.quantity > 0));
      }, 200);
      return updated;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);
  const clearLastAdded = () => setLastAdded(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  let subtotal = Number(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  let totalPrice = Number((subtotal + shippingFee).toFixed(2));

  window.__getCartTotal = () => totalPrice;

  window.__getCartInfo = () => ({
    cartId,
    items: cart.map(({ id, name, price, quantity, image_url, brand }) => ({ id, name, price, quantity, image_url, brand })),
    quantity: totalItems,
    price: cart.reduce((sum, item) => sum + item.price, 0),
    subtotal,
    total: totalPrice,
  });

  window.__syncCartToApi = syncCartToApi;

  window.__syncCartFromServer = syncCartFromServer;

  window.__getCartApi = () => ({
    cart_id: cartId,
    line_items: cart.map((item) => ({
      item: {
        id: String(item.id)
      },
      quantity: item.quantity,
      price: {
        amount: item.price.toFixed(2),
        currency: 'USD'
      }
    })),
    total_estimate: {
      amount: totalPrice.toFixed(2),
      currency: 'USD'
    }
  });

  window.__clearSessionData = () => {
    // Clear DY cookies and session storage
    Helper.removeStoredValue('_dyid');
    Helper.removeStoredValue('_dyjsession');
    Helper.removeStoredValue('_dyMuseChatId');

    sessionStorage.removeItem('_dyid');
    sessionStorage.removeItem('_dyjsession');
    sessionStorage.removeItem('_dyMuseChatId');

    // Clear cart ID
    clearCartId();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        lastAdded,
        clearLastAdded,
        clearCartId,
        clearCartFromServer,
        syncCartFromServer,
        cartId,
        totalItems,
        subtotal,
        totalPrice,
        shippingFee,
        shippingThreshold: SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
