import { useEffect, useRef, useCallback } from 'react';

export const useCartWebSocket = (cartId, onCartUpdate) => {
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayRef = useRef(1000);
  const onCartUpdateRef = useRef(onCartUpdate); // Capture callback in ref

  // Update ref when callback changes (without triggering reconnect)
  useEffect(() => {
    onCartUpdateRef.current = onCartUpdate;
  }, [onCartUpdate]);

  const getWebSocketUrl = useCallback(() => {
    // In production, use env var for backend URL; in dev, use localhost:5000
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    if (isProduction) {
      // Production: use backend URL from env var
      const backendUrl = process.env.REACT_APP_API_URL;
      if (!backendUrl) {
        console.warn('[useCartWebSocket] REACT_APP_API_URL not configured. WebSocket will fail on production.');
        return null;
      }
      // Remove protocol if present, add wss
      const host = backendUrl.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
      return `${protocol}//${host}`;
    } else {
      // Development: connect to localhost:5000
      return `${protocol}//localhost:5000`;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const wsUrl = getWebSocketUrl();
      if (!wsUrl) {
        console.warn('[useCartWebSocket] WebSocket URL unavailable. Skipping connection.');
        return;
      }
      
      console.log('[useCartWebSocket] Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[useCartWebSocket] Connected');
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = 1000;

        // Subscribe to cart updates
        if (cartId && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'SUBSCRIBE',
            cartId
          }));
          console.log('[useCartWebSocket] Subscribed to cartId:', cartId);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[useCartWebSocket] Received message:', message.type);

          if (message.type === 'CART_UPDATE' && message.cartId === cartId) {
            console.log('[useCartWebSocket] Cart updated:', message.data);
            if (onCartUpdateRef.current) {
              onCartUpdateRef.current(message.data);
            }
          } else if (message.type === 'SUBSCRIBED') {
            console.log('[useCartWebSocket] Subscription confirmed:', message.cartId);
          }
        } catch (error) {
          console.error('[useCartWebSocket] Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[useCartWebSocket] WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('[useCartWebSocket] Disconnected');
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`[useCartWebSocket] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          setTimeout(connect, reconnectDelayRef.current);
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 10000); // Exponential backoff, max 10s
        } else {
          console.warn('[useCartWebSocket] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[useCartWebSocket] Error creating WebSocket:', error);
    }
  }, [cartId, getWebSocketUrl]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        cartId
      }));
    }
  }, [cartId]);

  useEffect(() => {
    let isMounted = true;

    // Only connect if we have a cartId
    if (cartId) {
      connect();
    }

    return () => {
      isMounted = false;
      unsubscribe();
      disconnect();
    };
  }, [cartId]); // Only reconnect when cartId changes

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect,
    reconnect: connect
  };
};
