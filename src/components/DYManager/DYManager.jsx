import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Helper } from '../../helpers/helper';

const DY_SECTION_ID = '8787656';

export const DYManager = () => {
  const location = useLocation();
  const { cart } = useCart();

  useEffect(() => {
    // 1. Determine Context
    const context = Helper.getDYContext(cart);

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
