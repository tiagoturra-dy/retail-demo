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
    // Connect to backend API server on port 5000 (or same host:port via proxy)
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    if (isProduction) {
      // In production, assume same host/port with proxy
      return `${protocol}//${window.location.host}`;
    } else {
      // In development, connect to backend API server on port 5000
      return `${protocol}//localhost:5000`;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const wsUrl = getWebSocketUrl();
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
