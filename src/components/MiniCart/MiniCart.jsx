import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { gaRemoveFromCart } from '../../lib/gaEvents';
import { Helper } from '../../helpers/helper';
import styles from './MiniCart.module.css';

export const MiniCart = ({ isOpen, onClose, onMouseEnter, onMouseLeave }) => {
  const { cart, subtotal, updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      gaRemoveFromCart(item, 1);
      removeFromCart(item.id);
      return;
    }

    updateQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = (item) => {
    gaRemoveFromCart(item, item.quantity);
    removeFromCart(item.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          aria-label="Shopping bag preview"
          className={styles.miniCart}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <header className={styles.header}>
            <h2 className={styles.title}>Shopping Bag</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close shopping bag preview">
              <X />
            </button>
          </header>

          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Your shopping bag is empty.</p>
              <Link to="/category/all" onClick={onClose}>Start shopping</Link>
            </div>
          ) : (
            <>
              <ul className={styles.itemList}>
                {cart.map((item) => (
                  <li className={styles.item} key={item.id}>
                    <Link className={styles.itemImageLink} to={`/product/${item.id}`} onClick={onClose}>
                      <img src={Helper.getProductImage(item.image_url || item.image)} alt={item.name} className={styles.itemImage} />
                    </Link>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemHeading}>
                        <Link className={styles.itemName} to={`/product/${item.id}`} onClick={onClose}>{item.name}</Link>
                        <button className={styles.removeButton} onClick={() => handleRemove(item)} aria-label={`Remove ${item.name} from bag`}>
                          <Trash2 />
                        </button>
                      </div>
                      <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                      <div className={styles.itemFooter}>
                        <div className={styles.quantityControls} aria-label={`Quantity for ${item.name}`}>
                          <button onClick={() => handleDecrease(item)} aria-label={`Decrease quantity of ${item.name}`}>
                            <Minus />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`}>
                            <Plus />
                          </button>
                        </div>
                        <span className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={`${styles.messagePlaceholder} dy-minicart-message`} />
              <footer className={styles.footer}>
                <div className={styles.subtotal}>
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className={styles.actions}>
                  <Link to="/cart" className={styles.viewBag} onClick={onClose}>View Bag</Link>
                  <Link to="/checkout" className={styles.checkout} onClick={onClose}>Checkout</Link>
                </div>
              </footer>
            </>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
};