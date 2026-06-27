import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { checkoutService } from '../../services/checkoutService';
import { Helper } from '../../helpers/helper';
import { MastercardClickToPayLogo } from '../../icons/MastercardClickToPayLogo/MastercardClickToPayLogo';
import styles from './CheckoutPage.module.css';

const DEFAULT_ADDRESS = {
  name: 'John Smith',
  address1: '123 Highland Rd',
  city: 'Some Creek',
  state: 'GA',
  zip: '30303',
  country: 'United States',
  phone: '4045551212',
  email: 'JSmith@email.com',
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, subtotal, shippingFee, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [promoOpen, setPromoOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const taxes = parseFloat((subtotal * 0.02).toFixed(2));
  const total = parseFloat((subtotal + taxes + shippingFee).toFixed(2));

  const userAddress = user
    ? {
        name: user.Name || user.name || DEFAULT_ADDRESS.name,
        address1: DEFAULT_ADDRESS.address1,
        city: DEFAULT_ADDRESS.city,
        state: DEFAULT_ADDRESS.state,
        zip: DEFAULT_ADDRESS.zip,
        country: DEFAULT_ADDRESS.country,
        phone: DEFAULT_ADDRESS.phone,
        email: DEFAULT_ADDRESS.email,
      }
    : DEFAULT_ADDRESS;

  const handleBuyNow = async () => {
    setIsProcessing(true);
    const result = await checkoutService.processCheckout({ cart, total });
    setIsProcessing(false);
    if (result.success) {
      clearCart();
      navigate('/thank-you', { state: { orderId: result.orderId } });
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        <h1 className={styles.checkoutTitle}>Checkout</h1>

        <div className={styles.checkoutGrid}>
          {/* ── Left column ── */}
          <div className={styles.checkoutLeft}>
            {/* My Information */}
            <div className={styles.infoBox}>
              <div className={styles.infoBoxHeader}>
                <span className={styles.infoBoxLabel}>MY INFORMATION</span>
                <button className={styles.changeBtn}>CHANGE</button>
              </div>
              <div className={styles.infoBoxContent}>
                <p>{userAddress.name}</p>
                <p>{userAddress.address1}</p>
                <p>{userAddress.city}, {userAddress.state}</p>
                <p>{userAddress.zip}</p>
                <p>{userAddress.country}</p>
                <p>{userAddress.phone}</p>
                <p>{userAddress.email}</p>
              </div>
            </div>

            {/* Payment */}
            <div className={styles.infoBox}>
              <div className={styles.infoBoxHeader}>
                <span className={styles.infoBoxLabel}>PAYMENT</span>
                <button className={styles.changeBtn}>CHANGE</button>
              </div>
              <div className={styles.paymentContent}>
                <MastercardClickToPayLogo />
                <span className={styles.paymentLabel}>Mastercard Click to Pay</span>
              </div>
            </div>

            {/* Promotion */}
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

            {/* Actions — desktop */}
            <div className={styles.actionsDesktop}>
              <Link to="/cart" className={styles.returnBtn}>
                <ArrowLeft size={14} /> RETURN TO CART
              </Link>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={isProcessing}
              >
                {isProcessing ? 'PROCESSING...' : 'BUY NOW'}
              </button>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className={styles.checkoutRight}>
            {/* Cart items */}
            <div className={styles.itemsList}>
              {cart.map((item, i) => (
                <div key={item.id} className={`${styles.checkoutItem} ${i < cart.length - 1 ? styles.checkoutItemBorder : ''}`}>
                  <img
                    src={Helper.getProductImage(item.image)}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    {item.color && <p className={styles.itemAttr}>Color: {item.color}</p>}
                    {item.size && <p className={styles.itemAttr}>Size: {item.size}</p>}
                  </div>
                  <div className={styles.itemPriceCol}>
                    {item.oldPrice && item.oldPrice > item.price ? (
                      <>
                        <p className={`${styles.itemPrice} ${styles.itemPriceSale}`}>{formatPrice(item.price * item.quantity)}</p>
                        <p className={styles.itemPriceOriginal}>{formatPrice(item.oldPrice * item.quantity)}</p>
                      </>
                    ) : (
                      <p className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className={styles.summaryBox}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Taxes</span>
                  <span>{formatPrice(taxes)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions — mobile */}
        <div className={styles.actionsMobile}>
          <button
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
            disabled={isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : 'BUY NOW'}
          </button>
          <Link to="/cart" className={styles.returnBtnMobile}>
            <ArrowLeft size={14} /> RETURN TO CART
          </Link>
        </div>
      </div>
    </div>
  );
};
