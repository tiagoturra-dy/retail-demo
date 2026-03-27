import { matchPath } from 'react-router-dom';

export const Helper = {
  getProductImage: (image) => {
    return image.startsWith('/') ? `https://se-demo-retail.use1.dev.pub.dydy.io/${image}` : image
  },
  getProducCategoriesDisplay: (categories) => {
    return Array.isArray(categories) ? 
      categories.slice(0, 3).join(' • ') : 
      categories.split('|').slice(0, 3).join(' • ')
  },
  /**
   * 1. Generates a random rating between 0 and 5.
   * @param {number} precision - Number of decimal places (default is 1).
   */
  getRandomRating: (precision = 1) => {
    const randomValue = Math.random() * 5;
    return parseFloat(randomValue.toFixed(precision));
  },
  /**
   * 2. Generates a random number of reviews.
   * @param {number} max - The upper limit of reviews (default 2500).
   */
  getRandomReviewCount: (max = 2500) => {
    return Math.floor(Math.random() * (max + 1));
  },
  getDYContext: (cart = []) => {
    const location = window.location;
    let context = { type: 'OTHER' };

    switch(true) {
      case location.pathname === '/':
        context = { type: 'HOMEPAGE' }
        break
      case location.pathname.includes('/category/'):
        const categoryMatch = matchPath('/category/:categoryName', location.pathname)
        const search = new URLSearchParams(location.search)
        const data = [categoryMatch.params.categoryName]
        search.get('sub') ? data.push(search.get('sub')) : ''
        search.get('item') ? data.push(search.get('item')) : ''
        context = { type: 'CATEGORY', data }
        break
      case location.pathname.includes('/product/'):
        const productMatch = matchPath('/product/:productId', location.pathname)
        context = { type: 'PRODUCT', data: [productMatch.params.productId] }
        break
      case location.pathname.includes('/cart'):
        const itemIds = cart.map(item => String(item.id))
        context = { type: 'CART', data: itemIds }
        break
    }
    return context;
  },
  getCookie: (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setCookie: (name, value, days = 365) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=${path}; SameSite=Lax`;  },
  removeCookie: (name) => {
    const host = window.location.hostname;
    const base = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    document.cookie = base;
    document.cookie = `${base}; domain=${host}`;
    document.cookie = `${base}; domain=.${host.split('.').slice(-2).join('.')}`;
  },
  getFreeShippingThreshold: () => {
    return 175
  },
  getShippingValue: () => {
    return 15
  },
}