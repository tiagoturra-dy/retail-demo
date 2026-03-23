import { useEffect } from 'react';
import { useLocation, useParams, matchPath } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const DY_SECTION_ID = '8787656';

export const DYManager = () => {
  const location = useLocation();
  const { cart } = useCart();

  useEffect(() => {
    // 1. Determine Context
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

    // 2. Update DY Global Object
    window.DY = window.DY || {};
    window.DY.recommendationContext = context;

    // 3. Trigger DY SPA API for route changes
    if (window.DY && typeof window.DY.API === 'function') {
      window.DY.API('spa', {
        context: context,
        countAsPageview: true
      });
    }

    console.log(`[Dynamic Yield SPA] Context updated for ${location.pathname}:`, context);
  }, [location]);

  return null;
};
