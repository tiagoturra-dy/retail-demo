const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;

const fireEvent = (...args) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag(...args);
};

const toItem = (product, quantity = 1) => {
  const categories = Array.isArray(product.categories)
    ? product.categories
    : (product.categories || '').split('|').filter(Boolean);
  return {
    item_id: String(product.sku || product.id || ''),
    item_name: product.name || '',
    item_category: categories[0] || product.category || '',
    item_category2: categories[1] || undefined,
    price: Number(product.price) || 0,
    quantity,
  };
};

export const gaAddToCart = (product, quantity = 1) => {
  fireEvent('event', 'add_to_cart', {
    currency: 'USD',
    value: (Number(product.price) || 0) * quantity,
    items: [toItem(product, quantity)],
  });
};

export const gaRemoveFromCart = (product, quantity = 1) => {
  fireEvent('event', 'remove_from_cart', {
    currency: 'USD',
    value: (Number(product.price) || 0) * quantity,
    items: [toItem(product, quantity)],
  });
};

export const gaViewItem = (product) => {
  fireEvent('event', 'view_item', {
    currency: 'USD',
    value: Number(product.price) || 0,
    items: [toItem(product)],
  });
};

export const gaViewCart = (cart, total) => {
  fireEvent('event', 'view_cart', {
    currency: 'USD',
    value: Number(total) || 0,
    items: cart.map((item) => toItem(item, item.quantity)),
  });
};

export const gaBeginCheckout = (cart, total) => {
  fireEvent('event', 'begin_checkout', {
    currency: 'USD',
    value: Number(total) || 0,
    items: cart.map((item) => toItem(item, item.quantity)),
  });
};

export const gaPurchase = ({ orderId, cart, total, tax, shipping }) => {
  fireEvent('event', 'purchase', {
    transaction_id: String(orderId),
    currency: 'USD',
    value: Number(total) || 0,
    tax: Number(tax) || 0,
    shipping: Number(shipping) || 0,
    items: cart.map((item) => toItem(item, item.quantity)),
  });
};

export const gaSearch = (searchTerm) => {
  if (!searchTerm) return;
  fireEvent('event', 'search', {
    search_term: searchTerm,
  });
};
