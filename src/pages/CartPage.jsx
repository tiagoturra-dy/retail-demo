import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService } from '../services/checkoutService';

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
      <div id="cart-empty" className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-300" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Your bag is empty</h2>
        <p className="text-zinc-500 mb-8">Looks like you haven't added anything to your bag yet.</p>
        <Link
          to="/category/all"
          className="inline-flex bg-zinc-900 text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div id="cart-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 cart-container">
      <h1 id="cart-title" className="text-4xl font-bold tracking-tight mb-12">Shopping Bag ({totalItems})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div id="cart-items-list" className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-6 pb-8 border-b border-zinc-100 group cart-item"
              >
                <Link to={`/product/${item.id}`} className="w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="text-lg font-bold text-zinc-900 hover:underline underline-offset-4">{item.name}</h3>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">{item.category} • {item.subcategory}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4 bg-zinc-50 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold">${item.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div id="cart-summary" className="lg:col-span-1">
          <div className="bg-zinc-50 rounded-3xl p-8 sticky top-32">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="pt-4 border-t border-zinc-200 flex justify-between text-xl font-bold text-zinc-900">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
            <button
              id="checkout-btn"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-zinc-900 text-white h-16 rounded-2xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer disabled:opacity-50"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'} <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-center text-zinc-400">
              By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

