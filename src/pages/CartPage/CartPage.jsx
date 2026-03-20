import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService } from '../../services/checkoutService';
import './CartPage.css';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const result = await checkoutService.processCheckout(cart, totalPrice);
    setIsCheckingOut(false);
    if (result.success) {
      const orderId = result.orderId;
      clearCart();
      navigate('/thank-you', { state: { orderId } });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-icon-wrapper">
          <ShoppingBag className="cart-empty-icon" />
        </div>
        <h2 className="cart-empty-title">Your bag is empty</h2>
        <p className="cart-empty-subtitle">Looks like you haven't added anything to your bag yet.</p>
        <Link to="/category/all" className="cart-empty-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1 className="cart-page-title">Shopping Bag ({totalItems})</h1>

      <div className="cart-grid">
        {/* Cart Items */}
        <div className="cart-items-list">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="cart-item group"
              >
                <Link to={`/product/${item.id}`} className="cart-item-image-link">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                </Link>
                <div className="cart-item-details">
                  <div>
                    <div className="cart-item-header">
                      <Link to={`/product/${item.id}`} className="cart-item-name-link">
                        <h3 className="cart-item-name">{item.name}</h3>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-remove-btn"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    </div>
                    <p className="cart-item-category">{item.category} • {item.subcategory}</p>
                  </div>
                  <div className="cart-item-footer">
                    <div className="cart-quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        <Minus className="quantity-icon" />
                      </button>
                      <span className="quantity-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus className="quantity-icon" />
                      </button>
                    </div>
                    <p className="cart-item-price">${item.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="cart-summary-col">
          <div className="cart-summary-card">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="summary-free">Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="summary-total-row">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="checkout-btn"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'} <ArrowRight className="checkout-icon" />
            </button>
            <p className="checkout-terms">
              By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
