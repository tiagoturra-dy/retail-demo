import React, { createContext, useContext, useState, useEffect } from 'react';
import { Helper } from '../helpers/helper';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  // Configurable shipping constants
  const SHIPPING_THRESHOLD = Helper.getFreeShippingThreshold();
  const FLAT_SHIPPING_FEE = Helper.getShippingValue();

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('retail_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('retail_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }

      // Trigger Dynamic Yield Event
      if (window.DY && typeof window.DY.API === 'function') {
        window.DY.API("event", {
          name: "Add to Cart",
          properties: {
            dyType: "add-to-cart-v1",
            value: product.price,
            currency: "USD",
            productId: String(product.id),
            quantity: 1,
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
    setCart((prev) => prev.filter((item) => item.id !== productId));
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  const totalPrice = subtotal + shippingFee;

  window.getCartTotal = () => { return totalPrice }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
