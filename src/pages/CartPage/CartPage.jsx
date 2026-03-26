import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService } from '../../services/checkoutService';
import { Helper } from '../../helpers/helper';
import styles from './CartPage.module.css';
import { ConfirmationModal } from '../../components/ConfirmationModal/ConfirmationModal';
import { personalizationService } from '../../services/personalizationService';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice, subtotal, shippingFee, shippingThreshold, totalItems, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const [recData] = await Promise.all([
        personalizationService.getRecommendations({groups: ['cart_recs'], isImplicitPageview: false, cart}),
      ]);
      setRecommendations(recData);
    };
    fetchData();
  }, [cart]);

  const amountToFreeShipping = Math.max(0, shippingThreshold - subtotal);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const result = await checkoutService.processCheckout(cart, totalPrice);
    setIsCheckingOut(false);
    if (result.success) {
      const orderId = result.orderId;

      // Trigger Dynamic Yield Purchase Event
      if (window.DY && typeof window.DY.API === 'function') {
        window.DY.API("event", {
          name: "Purchase",
          properties: {
            uniqueTransactionId: String(orderId),
            dyType: "purchase-v1",
            value: Number(totalPrice),
            currency: "USD",
            cart: cart.map(item => ({
              productId: String(item.id),
              quantity: item.quantity,
              itemPrice: Number(item.price)
            }))
          }
        });
        console.log('[Dynamic Yield] Purchase event triggered for order:', orderId);
      }

      clearCart();
      navigate('/thank-you', { state: { orderId } });
    }
  };

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id);
      setItemToRemove(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={`cart__emptyContainer ${styles.cartEmptyContainer}`}>
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
    <div className={`dy-cart-container ${styles.cartPageContainer}`}>
      <h1 className={styles.cartPageTitle}>Shopping Bag ({totalItems})</h1>

      <div className={styles.cartGrid}>
        {/* Cart Items */}
        <div className={`dy-cart-items ${styles.cartItemsList}`}>
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`${styles.cartItem} group dy-cart-item`}
              >
                <Link to={`/product/${item.id}`} className={styles.cartItemImageLink}>
                  <img src={Helper.getProductImage(item.image)} alt={item.name} className={styles.cartItemImage} />
                </Link>
                <div className={styles.cartItemDetails}>
                  <div>
                    <div className={styles.cartItemHeader}>
                      <Link to={`/product/${item.id}`} className={styles.cartItemNameLink}>
                        <h3 className={styles.cartItemName}>{item.name}</h3>
                      </Link>
                      <button
                        onClick={() => handleRemoveClick(item)}
                        className={styles.cartItemRemoveBtn}
                      >
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </div>
                    <p className={styles.cartItemCategory}>{Helper.getProducCategoriesDisplay(item.categories)}</p>
                  </div>
                  <div className={styles.cartItemFooter}>
                    <div className={styles.cartQuantityControls}>
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            handleRemoveClick(item);
                          } else {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
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
                    <p className={styles.cartItemPrice}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className={styles.cartSummaryCol}>
          {amountToFreeShipping > 0 && (
            <div className="cart__freeShipping mb-6 rounded-xl bg-zinc-50 p-4 border border-zinc-100">
              <p className="text-sm text-zinc-600 mb-2">
                You're <span className="font-bold text-zinc-900">{formatPrice(amountToFreeShipping)}</span> away from free shipping!
              </p>
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
          <div className={styles.cartSummaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryDetails}>
              <div className={`dy-subtotal-value ${styles.summaryRow}`}>
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className={`dy-shipping-value ${styles.summaryRow}`}>
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className={styles.summaryFree}>Free</span>
                ) : (
                  <span>{formatPrice(shippingFee.toFixed(2))}</span>
                )}
              </div>
              <div className={`dy-tax-value ${styles.summaryRow}`}>
                <span>Tax</span>
                <span>{formatPrice(0.00)}</span>
              </div>
              <div className={`dy-total-value ${styles.summaryTotalRow}`}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
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

      {/* Recommendations */}
      {recommendations?.choices?.some(choice => choice.name === 'cart_recs1') &&
        recommendations?.choices?.filter(choice => choice.name === 'cart_recs1').map(choice => (
          <RecsCarousel id="dy-recs-1" key={choice.name} recommendations={{choices: [choice]}} additionalClass='dy-cart-recs' />
        ))
      }

      <ConfirmationModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove item?"
        message={`Are you sure you want to remove "${itemToRemove?.name}" from your bag?`}
        confirmText="Remove"
        cancelText="Keep it"
      />
    </div>
  );
};
