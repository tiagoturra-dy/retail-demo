import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService } from '../../services/checkoutService';
import { Helper } from '../../helpers/helper';
import styles from './CartPage.module.css';
import { ConfirmationModal } from '../../components/ConfirmationModal/ConfirmationModal';
import { personalizationService } from '../../services/personalizationService';
import { RecsCarousel } from '../../components/RecsCarousel/RecsCarousel';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, shippingFee, totalItems } = useCart();
  const { formatPrice } = useCurrency();
  const [isCheckingOut] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [clearAllPending, setClearAllPending] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [promoOpen, setPromoOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(Helper.getStoredValue('dyRetailDemoWishlist') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const [recData] = await Promise.all([
        personalizationService.getRecommendations({ groups: ['cart_recs'], isImplicitPageview: false, cart }),
      ]);
      setRecommendations(recData);
    };
    fetchData();
  }, [cart]);

  const taxes = parseFloat((subtotal * 0.02).toFixed(2));

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleRemoveClick = (item) => setItemToRemove(item);

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id);
      setItemToRemove(null);
    }
  };

  const handleConfirmClearAll = () => {
    clearCart();
    setClearAllPending(false);
  };

  const handleWishlist = (item) => {
    const updated = wishlist.includes(item.id)
      ? wishlist.filter(id => id !== item.id)
      : [...wishlist, item.id];
    setWishlist(updated);
    Helper.setStoredValue('dyRetailDemoWishlist', JSON.stringify(updated));
  };

  if (cart.length === 0) {
    return (
      <div className={`cart__emptyContainer ${styles.cartEmptyContainer}`}>
        <h2 className={styles.cartEmptyTitle}>Your Shopping Bag is empty</h2>
        <p className={styles.cartEmptySubtitle}>Looks like you haven't added anything to your shopping bag yet.</p>
        <Link to="/category/all" className={styles.cartEmptyBtn}>
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className={`dy-cart-container ${styles.cartPageContainer}`}>
      <div className={styles.cartPageTitleRow}>
        <h1 className={styles.cartPageTitle}>Shopping Bag [{totalItems}]</h1>
        <button className={styles.clearAllBtn} onClick={() => setClearAllPending(true)}>Clear all</button>
      </div>

      <div className={styles.cartGrid}>
        {/* Cart Items */}
        <div className={`dy-cart-items ${styles.cartItemsList}`}>
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={`${styles.cartItem} dy-cart-item`}
              >
                <Link to={`/product/${item.id}`} className={styles.cartItemImageLink}>
                  <img src={Helper.getProductImage(item.image)} alt={item.name} className={styles.cartItemImage} />
                </Link>

                <div className={styles.cartItemDetails}>
                  {/* Name / attrs / wishlist — mobile remove button sits here */}
                  <div className={styles.cartItemMeta}>
                    <div className={styles.cartItemMetaText}>
                      <Link to={`/product/${item.id}`} className={styles.cartItemNameLink}>
                        <h3 className={styles.cartItemName}>{item.name}</h3>
                      </Link>
                      {item.color && <p className={styles.cartItemAttr}>Color: {item.color}</p>}
                      {item.size && <p className={styles.cartItemAttr}>Size: {item.size}</p>}
                      <button className={styles.wishlistLink} onClick={() => handleWishlist(item)}>
                        {wishlist.includes(item.id) ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
                      </button>
                    </div>
                    {/* Visible on mobile only */}
                    <button className={styles.removeMobile} onClick={() => handleRemoveClick(item)} aria-label="Remove item">
                      <X className={styles.removeIcon} />
                    </button>
                  </div>

                  {/* Qty + price + desktop remove */}
                  <div className={styles.cartItemControls}>
                    <div className={styles.cartQuantityControls}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => {
                          if (item.quantity === 1) handleRemoveClick(item);
                          else updateQuantity(item.id, item.quantity - 1);
                        }}
                      >
                        <Minus className={styles.quantityIcon} />
                      </button>
                      <span className={styles.quantityText}>{item.quantity}</span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className={styles.quantityIcon} />
                      </button>
                    </div>
                    <div className={styles.cartItemPriceCol}>
                      {item.oldPrice && item.oldPrice > item.price ? (
                        <>
                          <p className={`${styles.cartItemPrice} ${styles.cartItemPriceSale}`}>{formatPrice(item.price * item.quantity)}</p>
                          <p className={styles.cartItemPriceOriginal}>{formatPrice(item.oldPrice * item.quantity)}</p>
                        </>
                      ) : (
                        <p className={styles.cartItemPrice}>{formatPrice(item.price * item.quantity)}</p>
                      )}
                    </div>
                    {/* Visible on desktop only */}
                    <button className={styles.removeDesktop} onClick={() => handleRemoveClick(item)} aria-label="Remove item">
                      <X className={styles.removeIcon} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className={styles.cartSummaryCol}>
          <div className={styles.cartSummaryCard}>
            <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>
            <div className={styles.summaryDetails}>
              <div className={`dy-subtotal-value ${styles.summaryRow}`}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={`dy-tax-value ${styles.summaryRow}`}>
                <span>Taxes</span>
                <span>{formatPrice(taxes)}</span>
              </div>
              <div className={`dy-shipping-value ${styles.summaryRow}`}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? '$0.00' : formatPrice(shippingFee)}</span>
              </div>
            </div>
            <div className={`dy-total-value ${styles.summaryTotalRow}`}>
              <span>TOTAL</span>
              <span>{formatPrice(subtotal + taxes + shippingFee)}</span>
            </div>
          </div>

          <div className={styles.promoBox}>
            <button className={styles.promoHeader} onClick={() => setPromoOpen(p => !p)}>
              <span>PROMOTION</span>
              <span className={styles.promoToggle}>{promoOpen ? '−' : '+'}</span>
            </button>
            {promoOpen && (
              <div className={styles.promoBody}>
                <input className={styles.promoInput} type="text" placeholder="Enter promo code" />
                <button className={styles.promoApply}>APPLY</button>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className={styles.checkoutBtn}
          >
            {isCheckingOut ? 'PROCESSING...' : 'PROCEED TO CHECK OUT'}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations?.choices?.some(choice => choice.name === 'cart_recs1') &&
        recommendations?.choices?.filter(choice => choice.name === 'cart_recs1').map(choice => (
          <RecsCarousel id="dy-recs-1" key={choice.name} recommendations={{ choices: [choice] }} additionalClass='dy-cart-recs' />
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

      <ConfirmationModal
        isOpen={clearAllPending}
        onClose={() => setClearAllPending(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear bag?"
        message="Are you sure you want to remove all items from your bag?"
        confirmText="Clear all"
        cancelText="Keep items"
      />
    </div>
  );
};
