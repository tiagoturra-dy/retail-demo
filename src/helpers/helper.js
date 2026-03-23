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
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },
  setCookie: (name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
  },
}