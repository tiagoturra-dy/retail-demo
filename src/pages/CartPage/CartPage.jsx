import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService } from '../../services/checkoutService';
import styles from './CartPage.module.css';

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
      <div className={styles.cartEmptyContainer}>
        <div className={styles.cartEmptyIconWrapper}>
          <ShoppingBag className={styles.cartEmptyIcon} />
        </div>
        <h2 className={styles.cartEmptyTitle}>Your bag is empty</h2>
        <p className={styles.cartEmptySubtitle}>Looks like you haven't added anything to your bag yet.</p>
        <Link to="/category/all" className={styles.cartEmptyBtn}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.cartPageTitle}>Shopping Bag ({totalItems})</h1>

      <div className={styles.cartGrid}>
        {/* Cart Items */}
        <div className={styles.cartItemsList}>
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`${styles.cartItem} group`}
              >
                <Link to={`/product/${item.id}`} className={styles.cartItemImageLink}>
                  <img src={item.image} alt={item.name} className={styles.cartItemImage} />
                </Link>
                <div className={styles.cartItemDetails}>
                  <div>
                    <div className={styles.cartItemHeader}>
                      <Link to={`/product/${item.id}`} className={styles.cartItemNameLink}>
                        <h3 className={styles.cartItemName}>{item.name}</h3>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={styles.cartItemRemoveBtn}
                      >
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </div>
                    <p className={styles.cartItemCategory}>{item.category} • {item.subcategory}</p>
                  </div>
                  <div className={styles.cartItemFooter}>
                    <div className={styles.cartQuantityControls}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={styles.quantityBtn}
                      >
                        <Minus className={styles.quantityIcon} />
                      </button>
                      <span className={styles.quantityText}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.quantityBtn}
                      >
                        <Plus className={styles.quantityIcon} />
                      </button>
                    </div>
                    <p className={styles.cartItemPrice}>${item.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className={styles.cartSummaryCol}>
          <div className={styles.cartSummaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.summaryFree}>Free</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className={styles.summaryTotalRow}>
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={styles.checkoutBtn}
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'} <ArrowRight className={styles.checkoutIcon} />
            </button>
            <p className={styles.checkoutTerms}>
              By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
